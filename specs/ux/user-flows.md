# User Flows

> Step-by-step user journeys for all LovePay features
> Last updated: 2026-04-07

---

## Flow 1: First-Time Sign Up (New User)

**Trigger**: User visits LovePay for the first time or opens a shareable link

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     User opens lovepay.com              Landing Page         Render marketing page
2     Clicks "Get Started" or "Sign In"   →                    Navigate to /sign-in
3     Enters email (e.g. alice@mail.com)  Sign In Page         Client validates email format
4     Clicks "Send Magic Link"            →                    Server: create VerificationToken
                                                                Resend: deliver magic link email
5     Sees confirmation                   Verify Request Page  "Check your email for a sign-in link"
6     Opens email, clicks magic link      →                    Server: verify token
                                                                → Token valid: create User + Session
                                                                → Run orphan claim
7     Automatically redirected            Dashboard            Show empty dashboard with welcome state
```

**Error paths:**
- Step 3: Invalid email → inline error "Please enter a valid email address"
- Step 5: Link not received → "Didn't receive it? Resend" with 60s cooldown
- Step 6: Expired token → Error page "This link has expired. Please request a new one."

---

## Flow 2: Return Sign In (Existing User)

**Trigger**: User returns to LovePay after previous session expired

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     User visits /dashboard              →                    Middleware: no valid session
2     Redirected to sign-in               Sign In Page         ?callbackUrl=/dashboard appended
3     Enters their email                  Sign In Page         Client validates email
4     Clicks "Send Magic Link"            →                    Server: find existing User
                                                                Send magic link email
5     Sees confirmation                   Verify Request Page  "Check your email"
6     Clicks magic link in email          →                    Server: verify, create Session
                                                                Run orphan claim (link any new requests)
7     Redirected to original destination  Dashboard            callbackUrl respected
```

---

## Flow 3: Create Payment Request

**Trigger**: User wants to request money from someone

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     Clicks "+ New Request" in sidebar   →                    Navigate to /requests/new
      or dashboard
2     Enters recipient email              Create Request Form  Live email format validation
3     Enters amount (e.g. "25.00")        Create Request Form  Auto-format: "$25.00"
                                                                Display in cents internally: 2500
4     Optionally enters note              Create Request Form  Character counter shows "23/500"
      "Dinner last Friday"
5     Clicks "Send Payment Request"       →                    Button shows loading spinner
                                                                Server Action: createRequest()
                                                                → Zod validate (server-side)
                                                                → Check sender ≠ recipient
                                                                → Create PaymentRequest in DB
                                                                → revalidatePath('/dashboard')
6     Redirected to detail page           Request Detail       Shows new request:
                                                                Amount: $25.00
                                                                Status: 🟡 Pending
                                                                Countdown: 6 days, 23 hours
                                                                Shareable link available
7     Sees success toast                  →                    "Payment request sent to bob@mail.com!"
```

**Error paths:**
- Step 2: Invalid email → "Please enter a valid email address"
- Step 2: Own email → "You cannot request money from yourself"
- Step 3: Amount $0 → "Amount must be at least $0.01"
- Step 3: Amount > $100K → "Amount cannot exceed $100,000.00"
- Step 4: Note > 500 chars → "Note must be 500 characters or fewer"
- Step 5: Network error → Toast: "Something went wrong. Please try again." (form data preserved)
- Step 5: Session expired → Redirect to sign-in, then back to /requests/new

---

## Flow 4: Pay an Incoming Request

**Trigger**: Recipient wants to pay a request they received

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     Sees request on dashboard           Dashboard            Incoming tab, status: 🟡 Pending
      (incoming tab)
2     Clicks on the request row           →                    Navigate to /requests/{id}
3     Reviews details:                    Request Detail       Amount: $25.00
      amount, sender, note, countdown                          From: alice@example.com
                                                                Note: "Dinner last Friday"
                                                                Countdown: 5 days, 14 hours
4     Clicks "Pay $25.00" button          →                    Confirmation dialog opens
5     Sees confirmation dialog:           Confirmation Dialog  "Pay $25.00 to alice@example.com?"
      "Pay $25.00 to alice@example.com?"                       [Confirm Payment] [Cancel]
6     Clicks "Confirm Payment"            →                    Dialog closes
                                                                Button disabled + spinner
                                                                Server Action: payRequest()
                                                                → requireAuth + guards
                                                                → $transaction (Serializable)
                                                                → sleep(2500ms) simulated delay
                                                                → UPDATE status=PAID, paidAt=now
                                                                → revalidatePath('/dashboard')
7     Sees processing state (2-3 sec)     Processing State     Spinner: "Processing payment..."
                                                                "Sending $25.00 to alice@example.com"
8     Sees success confirmation           Success State        ✓ "Payment Successful!"
                                                                "$25.00 sent to alice@example.com"
                                                                [Back to Dashboard]
9     Clicks "Back to Dashboard"          Dashboard            Request now shows: 🟢 Paid
```

**Error paths:**
- Step 6: Request already paid (race) → "This request has already been paid."
- Step 6: Request expired during viewing → "This request has expired and can no longer be paid."
- Step 6: Request cancelled by sender → "This request was cancelled by the sender."
- Step 6: Network error → "Something went wrong. Please try again."

---

## Flow 5: Decline an Incoming Request

**Trigger**: Recipient doesn't want to pay the request

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     Views incoming request              Request Detail       Amount, sender, note, countdown
2     Clicks "Decline" button             →                    Confirmation dialog opens
3     Sees confirmation:                  Confirmation Dialog  "Decline this request from
      "Decline this request?"                                   alice@example.com?"
                                                                [Yes, Decline] [Cancel]
4     Clicks "Yes, Decline"               →                    Server Action: declineRequest()
                                                                → $transaction (Serializable)
                                                                → UPDATE status=DECLINED
                                                                → revalidatePath('/dashboard')
5     Toast: "Request declined"           →                    
6     Redirected to dashboard             Dashboard            Request shows: 🔴 Declined
```

---

## Flow 6: Cancel an Outgoing Request

**Trigger**: Sender wants to withdraw their payment request

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     Views outgoing tab on dashboard     Dashboard            Outgoing tab, status: 🟡 Pending
2     Clicks on the request               →                    Navigate to /requests/{id}
3     Reviews details, sees               Request Detail       Amount: $25.00
      "Cancel Request" button                                   To: bob@example.com
                                                                Shareable link section
4     Clicks "Cancel Request"             →                    Confirmation dialog opens
5     Sees confirmation:                  Confirmation Dialog  "Cancel this payment request?
      "Cancel this request?"                                    This cannot be undone."
                                                                [Yes, Cancel] [Go Back]
6     Clicks "Yes, Cancel"                →                    Server Action: cancelRequest()
                                                                → $transaction (Serializable)
                                                                → UPDATE status=CANCELLED
                                                                → revalidatePath('/dashboard')
7     Toast: "Request cancelled"          →                    
8     Redirected to dashboard             Dashboard            Request shows: ⚪ Cancelled
```

---

## Flow 7: Open Shareable Link (Not Logged In)

**Trigger**: Someone receives a shareable link and opens it without having an account

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     Opens link: lovepay.com/r/abc123    →                    Server: fetch request by token
2     Sees read-only request info         Shareable Link Page  Amount: $25.00
                                                                From: Alice Johnson
                                                                Note: "Dinner last Friday"
                                                                Status: 🟡 Pending
                                                                [Sign in to pay this request]
3     Clicks "Sign in to pay"             →                    Navigate to:
                                                                /sign-in?callbackUrl=/r/abc123
4     Enters email, gets magic link       Sign In / Verify     Standard magic link flow
5     Clicks magic link in email          →                    Server: create User + Session
                                                                → ORPHAN CLAIM runs:
                                                                  UPDATE requests SET recipientId
                                                                  WHERE recipientEmail = bob@...
                                                                  AND recipientId IS NULL
6     Redirected back to /r/abc123        Shareable Link Page  NOW sees full detail with actions:
                                                                Amount: $25.00
                                                                From: Alice Johnson
                                                                [Pay $25.00] [Decline]
7     Can now pay or decline              →                    Standard pay/decline flow
```

---

## Flow 8: View Expired Request

**Trigger**: User views a request that has passed its 7-day expiration

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     Opens dashboard                     Dashboard            markExpiredOnRead() runs
                                                                Updates status in DB if needed
2     Sees expired request in list        Dashboard            Status: 🔴 Expired
3     Clicks on the request               →                    Navigate to /requests/{id}
4     Sees expired detail view            Request Detail       Amount: $100.00 (muted)
                                                                Status: 🔴 Expired
                                                                From: dave@example.com
                                                                Created: March 28, 2026
                                                                "This request expired on April 4"

                                                                ⚠️ "This request has expired and
                                                                can no longer be paid."

                                                                [Pay $100.00] ← DISABLED (grayed)
                                                                [Dismiss] ← Active (archive)
                                                                [Back to Dashboard]
5     Clicks "Dismiss"                    →                    Marks as acknowledged
6     Returns to dashboard                Dashboard            Expired request still visible
                                                                but user has acknowledged it
```

**For sender viewing expired outgoing:**
- No action buttons
- Message: "This request expired on {date} without being paid"
- "Back to Dashboard" link

---

## Flow 9: Dashboard Navigation & Filtering

**Trigger**: User manages their requests on the dashboard

```
Step  Action                              Screen               System Response
────  ──────────────────────────────────  ───────────────────  ─────────────────────────────
1     Lands on /dashboard                 Dashboard            Default: Incoming tab, All Status
                                                                Stats cards loaded
                                                                Request table: most recent first
2     Clicks "Outgoing" tab              Dashboard            URL → ?tab=outgoing
                                                                Table shows sent requests
                                                                Stats cards update for outgoing
3     Selects "Pending" from filter       Dashboard            URL → ?tab=outgoing&status=pending
                                                                Table shows only pending outgoing
                                                                Stats cards unchanged
4     Types "alice" in search             Dashboard            URL → ?tab=outgoing&status=pending&q=alice
                                                                300ms debounce
                                                                Table filters to matching results
5     No results → sees empty state       Dashboard            "No requests found for 'alice'."
                                                                [Clear search] link
6     Clicks "Clear search"               Dashboard            Search cleared, URL updated
                                                                Results return for current filter
7     Clicks "All Statuses" filter        Dashboard            URL → ?tab=outgoing
                                                                All outgoing requests shown
8     Scrolls to bottom (if > 10)         Dashboard            "Showing 1-10 of 23 requests"
                                                                [Previous] [Next] buttons
9     Clicks "Next"                       Dashboard            URL → ?tab=outgoing&page=2
                                                                "Showing 11-20 of 23 requests"
```
