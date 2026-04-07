# Product Specification: LovePay — P2P Payment Request

> Version: 1.0
> Date: 2026-04-07
> Status: Draft
> Author: Engineering Team

---

## 1. Product Overview

### 1.1 Purpose
LovePay is a peer-to-peer payment request application that allows users to **request money from others** via email. Similar to Venmo's "Request" or Cash App's payment request feature, but focused on simplicity and speed.

### 1.2 Target Users
- Individuals splitting bills, rent, group expenses
- Freelancers requesting payment from clients
- Anyone who needs to collect money from someone they know

### 1.3 Core Value Proposition
Send a payment request in 10 seconds. Recipient pays with one click. Both parties see real-time status.

### 1.4 Scope
**In Scope (v1):**
- Email-based authentication (magic link)
- Create, pay, decline, cancel payment requests
- Dashboard with filtering and search
- Request expiration (7-day TTL)
- Shareable request links
- Responsive web app (mobile + desktop)
- Simulated payment processing

**Out of Scope (v2+):**
- Phone number as recipient identifier
- SMS notifications
- Real payment gateway integration (Stripe, Plaid)
- Group payment splitting
- Recurring payment requests
- Push notifications
- Transaction history export
- Multi-currency support

---

## 2. User Personas

### 2.1 Requester (Sender)
The person who **creates** a payment request. They want to collect money from someone.
- Creates requests specifying recipient email, amount, and optional note
- Tracks outgoing requests on their dashboard
- Can cancel pending requests
- Receives notification when request is paid or declined

### 2.2 Recipient (Payer)
The person who **receives** a payment request. They are asked to pay.
- Views incoming requests on their dashboard
- Can pay or decline requests
- Receives request via shareable link or sees it after signing in
- May or may not have an existing account

### 2.3 New User (Unregistered Recipient)
A recipient who does **not** have a LovePay account yet.
- Receives a shareable link from the requester (via email, text, etc.)
- Opens the link, sees request details in read-only mode
- Signs up via magic link to pay or decline
- Upon first sign-in, all pending requests addressed to their email are automatically linked to their account

---

## 3. Feature Specifications

---

### 3.1 Authentication

#### 3.1.1 Sign In Flow
1. User navigates to `/sign-in`
2. User enters their email address
3. System validates email format
4. System sends magic link via Resend email service
5. User is redirected to `/verify-request` — "Check your email for a sign-in link"
6. User clicks magic link in their email
7. System verifies token, creates session
8. If **first-time user**: account is auto-created with the provided email
9. On sign-in event: system runs **orphan request claim** — links all `PaymentRequest` records where `recipientEmail` matches and `recipientId` is null
10. User is redirected to `/dashboard`

#### 3.1.2 Sign Out Flow
1. User clicks profile avatar → dropdown → "Sign Out"
2. Session is destroyed
3. User is redirected to landing page `/`

#### 3.1.3 Session Management
- Sessions stored in database via Prisma adapter
- Session token set as HttpOnly, Secure, SameSite=Lax cookie
- Session expiry: 30 days (configurable)
- On every request: proxy (`proxy.ts`) checks session validity for protected routes

#### 3.1.4 Protected Routes
The following routes require authentication:
- `/dashboard`
- `/requests/*`
- `/settings`

Unauthenticated access → redirect to `/sign-in?callbackUrl={originalUrl}`

#### 3.1.5 Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid email format | Inline error: "Please enter a valid email address" |
| Email not delivered | `/verify-request` page shows "Didn't receive it? Resend" link with 60s cooldown |
| Expired magic link | Error page: "This link has expired. Please request a new one." |
| Already signed in user visits `/sign-in` | Redirect to `/dashboard` |
| User signs in with different email | New account created, separate from previous |

#### 3.1.6 Acceptance Criteria
- [ ] User can sign in with any valid email address
- [ ] First-time email creates a new account automatically
- [ ] Magic link expires after 24 hours
- [ ] Orphaned requests are claimed on sign-in
- [ ] Protected routes redirect to sign-in with callback URL
- [ ] Sign-out destroys session and redirects to landing page

---

### 3.2 Request Creation

#### 3.2.1 User Flow
1. User clicks "+ New Request" from dashboard or sidebar navigation
2. User is taken to `/requests/new`
3. User fills in the form:
   - **Recipient Email** (required): The email of the person they want money from
   - **Amount** (required): Dollar amount with cents (e.g., $25.00)
   - **Note** (optional): Description or reason for the request
4. User clicks "Send Request"
5. System validates all inputs (client-side + server-side)
6. On success:
   - Request is created with status `PENDING`
   - `expiresAt` is set to `createdAt + 7 days`
   - Unique `shareableToken` is generated
   - User is redirected to `/requests/{id}` (detail page)
   - Toast notification: "Payment request sent to {email}!"
7. On failure:
   - Form stays open with inline errors on failing fields
   - No request is created

#### 3.2.2 Input Validation Rules

| Field | Type | Required | Min | Max | Format | Error Message |
|-------|------|----------|-----|-----|--------|---------------|
| `recipientEmail` | string | Yes | — | 254 chars | RFC 5322 email | "Please enter a valid email address" |
| `amount` | number | Yes | $0.01 (1 cent) | $100,000.00 (10M cents) | Dollars with up to 2 decimal places | See below |
| `note` | string | No | — | 500 chars | Free text, trimmed | "Note must be 500 characters or fewer" |

**Amount-specific validation errors:**
| Condition | Error Message |
|-----------|---------------|
| Empty / not provided | "Amount is required" |
| Not a number | "Please enter a valid amount" |
| Less than $0.01 | "Amount must be at least $0.01" |
| Greater than $100,000.00 | "Amount cannot exceed $100,000.00" |
| More than 2 decimal places | "Amount can have at most 2 decimal places" |
| Negative | "Amount must be a positive number" |
| Zero | "Amount must be at least $0.01" |

**Recipient email validation errors:**
| Condition | Error Message |
|-----------|---------------|
| Empty / not provided | "Recipient email is required" |
| Invalid format | "Please enter a valid email address" |
| Same as sender's email | "You cannot request money from yourself" |

#### 3.2.3 Amount Input UX
- Input displays with `$` prefix (non-editable)
- User types digits, auto-formatted as currency: typing `2500` → `$25.00`
- Alternatively: user can type `25.00` directly with decimal
- Stored internally as integer cents: `$25.00` → `2500`
- Display always shows two decimal places: `$5.00`, never `$5` or `$5.0`

#### 3.2.4 Server-Side Processing
```
1. requireAuth() → get current user
2. Zod.parse(formData) → validate all inputs
3. Check: sender.email !== recipientEmail → prevent self-request
4. Convert display amount to cents: Math.round(amount * 100)
5. prisma.$transaction:
   a. Create PaymentRequest {
        amountCents, note, status: PENDING,
        senderId: currentUser.id,
        recipientEmail,
        recipientId: findUserByEmail(recipientEmail)?.id ?? null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        shareableToken: generateCUID()
      }
6. revalidatePath('/dashboard')
7. redirect(`/requests/${request.id}`)
```

#### 3.2.5 Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Self-request (sender email = recipient email) | Validation error: "You cannot request money from yourself" |
| Recipient has no account | Request created with `recipientId: null`. When recipient signs up, orphan claim links it. |
| Recipient already has account | Request created with `recipientId` set. Appears in their dashboard immediately. |
| Duplicate request (same sender, recipient, amount) | Allowed — users may have legitimate reasons to send multiple requests |
| Network error during submission | Client shows error toast: "Something went wrong. Please try again." Form data preserved. |
| Session expired during form fill | On submit: redirect to sign-in. After re-auth, redirect back to `/requests/new` (form data lost — acceptable trade-off) |
| Very long note (>500 chars) | Inline error, character counter shows `523/500` in red |

#### 3.2.6 Acceptance Criteria
- [ ] User can create a request with valid email, amount, and optional note
- [ ] All validation rules enforced both client-side and server-side
- [ ] Self-request is prevented
- [ ] Amount stored as integer cents in database
- [ ] Shareable token generated and unique
- [ ] Expiration set to exactly 7 days from creation
- [ ] Success redirects to detail page with toast notification
- [ ] Validation errors shown inline per field
- [ ] Amount input formats as currency while typing

---

### 3.3 Request Management Dashboard

#### 3.3.1 Layout Overview
The dashboard at `/dashboard` is the main hub. It shows:
- **Stats cards** at the top: summary counts per status
- **Tab bar**: toggle between "Incoming" and "Outgoing" views
- **Toolbar**: search input + status filter dropdown
- **Request table/list**: sorted by most recent first

#### 3.3.2 Stats Cards
Four summary cards displayed horizontally (scrollable on mobile):

| Card | Label | Count | Color |
|------|-------|-------|-------|
| 1 | Pending | Count of PENDING requests (both in + out) | Yellow/Amber |
| 2 | Paid | Count of PAID requests (both in + out) | Green |
| 3 | Declined | Count of DECLINED requests (both in + out) | Red |
| 4 | Total | Total count of all requests | Blue/Gray |

Stats reflect the **currently active tab** (Incoming or Outgoing).

#### 3.3.3 Incoming Tab (Requests received by user)
Shows requests where the current user is the **recipient**.

**Table columns (Desktop):**
| Column | Content | Sortable |
|--------|---------|----------|
| From | Sender's name or email | No |
| Amount | Formatted: `$25.00` | No |
| Note | Truncated to 50 chars with ellipsis | No |
| Status | Color-coded badge | No |
| Date | Relative: "2 days ago" | No |
| Actions | "View" link → detail page | — |

**Card layout (Mobile):**
Each request is a card showing:
- Sender name/email
- Amount (prominent, large text)
- Note (truncated)
- Status badge
- Relative date
- Tap entire card → navigate to detail page

**Quick actions on incoming requests:**
- Row/card click → navigate to `/requests/{id}`

#### 3.3.4 Outgoing Tab (Requests sent by user)
Shows requests where the current user is the **sender**.

**Table columns (Desktop):**
| Column | Content | Sortable |
|--------|---------|----------|
| To | Recipient's name or email | No |
| Amount | Formatted: `$25.00` | No |
| Note | Truncated to 50 chars with ellipsis | No |
| Status | Color-coded badge | No |
| Date | Relative: "2 days ago" | No |
| Actions | "View" link → detail page | — |

**Card layout (Mobile):** Same structure as incoming, but "To" instead of "From".

#### 3.3.5 Status Badges
| Status | Label | Color | Background |
|--------|-------|-------|------------|
| PENDING | Pending | Amber/Dark text | Amber/Light |
| PAID | Paid | Green/Dark text | Green/Light |
| DECLINED | Declined | Red/Dark text | Red/Light |
| CANCELLED | Cancelled | Gray/Dark text | Gray/Light |
| EXPIRED | Expired | Dark Red/White text | Dark Red/Light |

#### 3.3.6 Filtering
**Status filter dropdown** with options:
- All Statuses (default)
- Pending
- Paid
- Declined
- Cancelled
- Expired

Filter is applied via URL search param: `?status=pending`
Changing filter updates URL, triggers server re-fetch.

#### 3.3.7 Search
**Search input** with placeholder: "Search by name or email..."
- Searches against: sender/recipient `name` and `email` fields
- Minimum 2 characters to trigger search
- Debounced: 300ms after last keystroke
- Applied via URL search param: `?q=alice`
- Search + filter can be combined: `?q=alice&status=pending`
- Clear search: X button inside input or delete all text

#### 3.3.8 Empty States
| Condition | Message | Action |
|-----------|---------|--------|
| No incoming requests at all | "No payment requests yet. When someone requests money from you, it will appear here." | — |
| No outgoing requests at all | "You haven't sent any payment requests yet." | "Create your first request →" button |
| No results matching filter | "No requests match your filters." | "Clear filters" link |
| No results matching search | "No requests found for '{query}'." | "Clear search" link |

#### 3.3.9 Pagination
- **Page size**: 10 requests per page
- **Navigation**: "Previous" / "Next" buttons at bottom
- URL param: `?page=2`
- Shows: "Showing 11-20 of 47 requests"
- If total ≤ 10: no pagination shown

#### 3.3.10 Expired Request Handling on Dashboard
- Expired requests are detected on read: if `status === PENDING && expiresAt < now`, display as EXPIRED
- Server-side: `markExpiredOnRead()` utility updates status in DB when encountered
- Expired badge shown, no action buttons on the row — user must click into detail to dismiss

#### 3.3.11 Tab Persistence
- Active tab stored in URL: `?tab=incoming` or `?tab=outgoing`
- Default: `incoming`
- Switching tabs preserves search and filter (or clears them — TBD)

#### 3.3.12 Data Freshness
- Dashboard data fetched in Server Component on page load
- After any action (pay, decline, cancel): `revalidatePath('/dashboard')` ensures fresh data
- Optional: 30-second polling via `router.refresh()` for updates from the other party

#### 3.3.13 Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User has 0 requests | Show empty state with appropriate message per tab |
| User has 100+ requests | Pagination kicks in, 10 per page |
| Request becomes expired while user is on dashboard | Refresh reveals expired status. 30s polling catches it. |
| Both search and filter active | AND logic: results must match both |
| Search term with special characters | Escaped before query, no SQL injection |

#### 3.3.14 Acceptance Criteria
- [ ] Dashboard shows incoming and outgoing tabs
- [ ] Stats cards show correct counts per status for active tab
- [ ] Status filter works correctly for all 5 statuses
- [ ] Search filters by sender/recipient name or email
- [ ] Search is debounced at 300ms
- [ ] Empty states shown with appropriate messages
- [ ] Pagination works with 10 items per page
- [ ] Expired requests shown with EXPIRED badge
- [ ] Tab state persisted in URL
- [ ] Responsive: table on desktop, cards on mobile

---

### 3.4 Request Detail View

#### 3.4.1 Route
- Authenticated: `/requests/{id}` — full detail with actions
- Public: `/r/{shareableToken}` — read-only or action-enabled depending on auth state

#### 3.4.2 Information Display
| Field | Format | Example |
|-------|--------|---------|
| Amount | Large, prominent, centered | **$25.00** |
| Status | Color-coded badge next to amount | 🟡 Pending |
| Direction label | "From" (incoming) or "To" (outgoing) | From: alice@example.com |
| Sender/Recipient | Name if available, otherwise email | Alice Johnson |
| Note | Full text (not truncated) | "Dinner last Friday at the Italian place" |
| Created date | Full format | April 7, 2026 at 2:30 PM |
| Expiration | Countdown + progress bar (if PENDING) | ⏳ Expires in: 5 days, 14 hours |
| Paid/Declined/Cancelled date | Full format (if applicable) | Paid on April 8, 2026 at 10:15 AM |

#### 3.4.3 Expiration Countdown (PENDING only)
- **Countdown text**: "Expires in: X days, Y hours, Z minutes"
- **Progress bar**: Visual bar showing time elapsed / total 7 days
  - Green (>3 days remaining)
  - Yellow (1-3 days remaining)
  - Red (<1 day remaining)
- **Live update**: Client-side timer updates every minute via `setInterval`
- When countdown hits 0:
  - Text changes to "This request has expired"
  - Progress bar fills completely (red)
  - Action buttons update (Pay disabled)
  - Status badge changes to EXPIRED

#### 3.4.4 Actions — Incoming Request (user is recipient)

**When PENDING and not expired:**
| Button | Style | Action | Confirmation |
|--------|-------|--------|--------------|
| Pay ${amount} | Primary (green, filled) | Triggers payment simulation | Yes — "Pay $25.00 to alice@example.com?" with Confirm/Cancel |
| Decline | Secondary (outline, muted) | Declines the request | Yes — "Decline this request from alice@example.com?" with Yes, Decline/Cancel |

**When PAID:**
- No action buttons
- Show: "You paid $25.00 on April 8, 2026" with checkmark icon
- "Back to Dashboard" link

**When DECLINED:**
- No action buttons
- Show: "You declined this request on April 8, 2026"
- "Back to Dashboard" link

**When EXPIRED:**
- Pay button: **visually present but disabled** (grayed out), tooltip: "This request has expired"
- Show dismissive message: "This request expired on April 14, 2026 and can no longer be paid."
- "Dismiss" button (outline, neutral): Archives/hides from dashboard — sets `status: EXPIRED` explicitly if not already, and marks as acknowledged
- "Back to Dashboard" link

**When CANCELLED (by sender):**
- No action buttons
- Show: "This request was cancelled by the sender on April 9, 2026"
- "Back to Dashboard" link

#### 3.4.5 Actions — Outgoing Request (user is sender)

**When PENDING:**
| Button | Style | Action | Confirmation |
|--------|-------|--------|--------------|
| Cancel Request | Destructive (red outline) | Cancels the request | Yes — "Cancel this payment request? This cannot be undone." with Yes, Cancel/Go Back |

Additionally:
- **Shareable link section**: Shows the link `https://{domain}/r/{token}` with a "Copy" button
- Copy button: Copies to clipboard, button text changes to "Copied!" for 2 seconds

**When PAID:**
- No action buttons
- Show: "Paid by {recipient} on April 8, 2026" with checkmark icon
- "Back to Dashboard" link

**When DECLINED:**
- No action buttons
- Show: "Declined by {recipient} on April 8, 2026"
- "Back to Dashboard" link

**When CANCELLED:**
- No action buttons
- Show: "You cancelled this request on April 9, 2026"
- "Back to Dashboard" link

**When EXPIRED:**
- No action buttons
- Show: "This request expired on April 14, 2026 without being paid"
- "Back to Dashboard" link

#### 3.4.6 Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User tries to view someone else's request via `/requests/{id}` | 404 page — request not found (security: don't reveal existence) |
| Request ID does not exist | 404 page |
| Request expires while user is viewing detail page | Countdown reaches 0, UI updates: Pay button disables, status changes to Expired. Client-side detection, no refresh needed. |
| User double-clicks Pay button | Idempotency: button disabled after first click, second click ignored. Server also checks idempotency. |
| Concurrent pay: two users somehow both try to pay | Serializable transaction ensures only one succeeds. Second receives error: "This request has already been paid." |
| User navigates to detail page of cancelled/expired request | Shows appropriate read-only state with explanation |

#### 3.4.7 Acceptance Criteria
- [ ] Detail page shows all request information correctly
- [ ] Countdown timer updates live for PENDING requests
- [ ] Progress bar changes color based on remaining time
- [ ] Pay button triggers confirmation → loading → success flow
- [ ] Decline button triggers confirmation → immediate status change
- [ ] Cancel button (outgoing) triggers confirmation → immediate status change
- [ ] Expired requests show disabled Pay button with explanation
- [ ] Shareable link displayed for outgoing PENDING requests with copy functionality
- [ ] 404 for non-existent or unauthorized requests
- [ ] Back to Dashboard link present on all terminal states

---

### 3.5 Payment Fulfillment (Simulation)

#### 3.5.1 Payment Flow
1. User clicks "Pay ${amount}" on incoming PENDING request
2. **Confirmation dialog** appears:
   - Title: "Confirm Payment"
   - Body: "Pay **$25.00** to **alice@example.com**?"
   - Buttons: "Confirm Payment" (primary) / "Cancel" (outline)
3. User clicks "Confirm Payment"
4. **Processing state** (2-3 seconds):
   - Dialog or inline area shows spinner
   - Text: "Processing payment..."
   - Sub-text: "Sending $25.00 to alice@example.com"
   - Pay button replaced with disabled "Processing..." state
   - All other buttons disabled during processing
5. **Server-side processing**:
   ```
   a. requireAuth()
   b. prisma.$transaction({ isolationLevel: 'Serializable' }):
      i.   Find request by ID
      ii.  Verify: recipient === currentUser
      iii. Verify: status === PENDING
      iv.  Verify: expiresAt > now
      v.   await sleep(2500) // simulate payment processing
      vi.  Update: status = PAID, paidAt = now
   c. revalidatePath('/dashboard')
   d. Return { success: true }
   ```
6. **Success state**:
   - Checkmark animation
   - Text: "Payment Successful!"
   - Sub-text: "$25.00 sent to alice@example.com"
   - Button: "Back to Dashboard"
7. **Dashboard update**:
   - Recipient's dashboard: request moves from PENDING to PAID
   - Sender's dashboard: request moves from PENDING to PAID (on next load/refresh)

#### 3.5.2 Failure Scenarios
| Failure | Server Response | User Message |
|---------|-----------------|--------------|
| Request already paid | `{ error: "already_paid" }` | "This request has already been paid." |
| Request expired | `{ error: "expired" }` | "This request has expired and can no longer be paid." |
| Request cancelled | `{ error: "cancelled" }` | "This request was cancelled by the sender." |
| Request declined | `{ error: "declined" }` | "This request has already been declined." |
| User is not the recipient | `{ error: "unauthorized" }` | "You are not authorized to pay this request." |
| Database error | `{ error: "server_error" }` | "Something went wrong. Please try again." |
| Network timeout | Client-side detection | "Connection lost. Please check your internet and try again." |

#### 3.5.3 Idempotency
- After clicking "Confirm Payment", the button is immediately disabled
- Server generates idempotency context from `requestId + userId`
- If same user attempts to pay same request twice:
  - First attempt: processes normally
  - Subsequent attempts: returns `{ error: "already_paid" }` (caught by status check in transaction)

#### 3.5.4 Both Dashboards Update
- **Immediate (recipient)**: After successful pay, `revalidatePath('/dashboard')` ensures recipient's next dashboard load shows PAID
- **Eventual (sender)**: Sender's dashboard shows PAID on next page load or 30-second polling refresh
- No WebSocket/real-time required — acceptable delay for sender's view

#### 3.5.5 Acceptance Criteria
- [ ] Confirmation dialog shown before payment
- [ ] Loading state displayed for 2-3 seconds
- [ ] Success state shown with checkmark and details
- [ ] Request status updated to PAID in database
- [ ] `paidAt` timestamp recorded
- [ ] Recipient's dashboard reflects PAID immediately after navigation
- [ ] Sender's dashboard reflects PAID on next load
- [ ] Double-click prevention: button disabled during processing
- [ ] All failure scenarios show appropriate error messages
- [ ] Back to Dashboard button after success

---

### 3.6 Request Expiration

#### 3.6.1 Expiration Rules
- Every request has `expiresAt = createdAt + 7 days` (168 hours exactly)
- Expiration is evaluated on **every read** (check-on-read pattern)
- No background cron job or scheduled task
- When a PENDING request is read and `expiresAt < now`:
  - Status is updated to `EXPIRED` in database
  - UI renders EXPIRED state

#### 3.6.2 Countdown Display (PENDING requests only)
**Format progression:**
| Remaining Time | Display Format |
|---------------|----------------|
| > 1 day | "Expires in: 5 days, 14 hours" |
| 1 hour – 24 hours | "Expires in: 8 hours, 23 minutes" |
| < 1 hour | "Expires in: 45 minutes" |
| < 5 minutes | "Expires in: 3 minutes" (red, pulsing) |
| 0 | "This request has expired" |

**Progress bar:**
| Remaining | Bar Fill | Color |
|-----------|----------|-------|
| 7-4 days (>50%) | 0-43% filled | Green |
| 4-1 days (15-50%) | 43-86% filled | Yellow/Amber |
| < 1 day (<15%) | 86-100% filled | Red |
| Expired | 100% filled | Dark Red |

#### 3.6.3 Client-Side Behavior
- Countdown timer component uses `useEffect` + `setInterval` (every 60 seconds)
- When countdown reaches 0 on client:
  - Timer text changes to "This request has expired"
  - Pay button becomes disabled
  - Status badge updates to EXPIRED
  - No server request needed — pure client-side detection
  - Next server interaction will persist the EXPIRED status

#### 3.6.4 Server-Side `markExpiredOnRead`
Utility function called in every query that returns payment requests:
```
function markExpiredOnRead(requests):
  for each request in requests:
    if request.status === PENDING AND request.expiresAt < now:
      update request.status = EXPIRED in DB
      request.status = EXPIRED  // mutate in-memory too
  return requests
```

This ensures:
- Dashboard shows correct status even without client-side timer
- Detail page shows correct status on first load
- Database is eventually consistent

#### 3.6.5 Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Request expires while user is on detail page | Client-side countdown reaches 0, UI updates without refresh |
| Request expires while user is on dashboard | Next refresh/polling cycle shows EXPIRED badge |
| User tries to pay expired request via direct API call | Server rejects: `expiresAt < now` check inside transaction |
| Request expires between opening detail page and clicking Pay | Server-side check catches it: returns `{ error: "expired" }` |
| Clock skew between client and server | Server time is authoritative. Client countdown is cosmetic. Server always validates. |

#### 3.6.6 Acceptance Criteria
- [ ] Expiration set to exactly 7 days from creation
- [ ] Countdown timer displays correctly in all time ranges
- [ ] Progress bar color changes based on remaining time
- [ ] Client-side timer updates every 60 seconds
- [ ] Expired requests cannot be paid (server enforced)
- [ ] Pay button disabled for expired requests
- [ ] Expired status persisted to database on read
- [ ] "This request has expired" message shown clearly

---

### 3.7 Shareable Link

#### 3.7.1 Link Format
- Pattern: `https://{domain}/r/{shareableToken}`
- Example: `https://lovepay.example.com/r/clx1abc2def3ghi4jkl`
- `shareableToken` is a CUID, separate from the internal request `id`
- Token is URL-safe, non-sequential, non-guessable

#### 3.7.2 Access Scenarios

**Scenario A: Authenticated recipient (request linked)**
- User is logged in
- Their `userId` matches `recipientId` on the request
- **Shows**: Full detail view with Pay/Decline actions
- Same as `/requests/{id}` view

**Scenario B: Authenticated user, unlinked recipient**
- User is logged in
- Their email matches `recipientEmail` but `recipientId` is null (shouldn't happen if orphan claim worked, but defensive check)
- **Action**: Link the request to user, then show full detail view

**Scenario C: Authenticated sender**
- User is logged in
- Their `userId` matches `senderId`
- **Shows**: Outgoing detail view (same as `/requests/{id}`)

**Scenario D: Authenticated user, not involved**
- User is logged in
- They are neither sender nor recipient
- **Shows**: Read-only view — amount, note, status, sender info. No action buttons. Message: "This request was sent to someone else."

**Scenario E: Not authenticated**
- User is not logged in
- **Shows**: Read-only request summary (amount, note, sender display name)
- Prominent CTA: "Sign in to pay this request" button
- Button links to `/sign-in?callbackUrl=/r/{token}`
- After sign-in, redirect back to `/r/{token}`
- Orphan claim runs on sign-in → request linked → full actions available

#### 3.7.3 Copy to Clipboard
- On outgoing PENDING request detail page: "Share Link" section
- Shows the full URL in a read-only input field
- "Copy" button next to it
- On click: copies URL to clipboard via `navigator.clipboard.writeText()`
- Button text changes to "Copied!" with checkmark for 2 seconds
- Falls back to `document.execCommand('copy')` if clipboard API unavailable

#### 3.7.4 Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid/non-existent token | 404 page: "This payment request was not found" |
| Expired request via shareable link | Show expired state (same as detail page) |
| Cancelled request via shareable link | Show cancelled state |
| Multiple people open same link | Each sees appropriate view based on their auth state |

#### 3.7.5 Acceptance Criteria
- [ ] Shareable link accessible without authentication (read-only)
- [ ] Authenticated recipient sees full actions
- [ ] Unauthenticated user sees sign-in CTA with callback URL
- [ ] After sign-in, orphan requests are claimed and user sees actions
- [ ] Copy button copies link to clipboard with feedback
- [ ] Invalid token shows 404
- [ ] Non-involved authenticated user sees read-only view

---

## 4. Validation Rules Summary

| Field | Rule | Client-Side | Server-Side | Error Message |
|-------|------|-------------|-------------|---------------|
| Email (sign-in) | RFC 5322 format | Yes | Yes | "Please enter a valid email address" |
| Recipient email | RFC 5322 format | Yes | Yes | "Please enter a valid email address" |
| Recipient email | Not empty | Yes | Yes | "Recipient email is required" |
| Recipient email | Not sender's email | No (needs session) | Yes | "You cannot request money from yourself" |
| Amount | Not empty | Yes | Yes | "Amount is required" |
| Amount | Positive number | Yes | Yes | "Amount must be a positive number" |
| Amount | ≥ $0.01 | Yes | Yes | "Amount must be at least $0.01" |
| Amount | ≤ $100,000.00 | Yes | Yes | "Amount cannot exceed $100,000.00" |
| Amount | Max 2 decimal places | Yes | Yes | "Amount can have at most 2 decimal places" |
| Note | ≤ 500 characters | Yes | Yes | "Note must be 500 characters or fewer" |
| Pay action | Request is PENDING | No | Yes | "This request is no longer pending" |
| Pay action | Request not expired | Yes (countdown) | Yes | "This request has expired" |
| Pay action | User is recipient | No | Yes | "You are not authorized to pay this request" |
| Decline action | Request is PENDING | No | Yes | "This request is no longer pending" |
| Decline action | User is recipient | No | Yes | "You are not authorized to decline this request" |
| Cancel action | Request is PENDING | No | Yes | "This request is no longer pending" |
| Cancel action | User is sender | No | Yes | "You are not authorized to cancel this request" |

---

## 5. Error States & Edge Cases (Comprehensive)

### 5.1 Network & Infrastructure
| Scenario | User Experience |
|----------|----------------|
| Server unreachable | Toast: "Unable to connect. Please check your internet connection." |
| Request timeout (>10s) | Toast: "Request timed out. Please try again." |
| Database connection lost | 500 error page: "Something went wrong. Please try again later." |
| Session expired during action | Redirect to sign-in with callback URL back to current page |

### 5.2 Concurrency
| Scenario | Behavior |
|----------|----------|
| Two users pay the same request simultaneously | Serializable transaction: first succeeds, second gets "already paid" error |
| User pays while sender cancels simultaneously | Transaction lock: whichever acquires lock first wins. Other gets appropriate error. |
| User declines while request expires simultaneously | Decline wins if lock acquired before expiry check. Otherwise shows expired. |

### 5.3 Data Integrity
| Scenario | Behavior |
|----------|----------|
| Amount stored incorrectly (float) | Prevented by schema: `amountCents Int` — Prisma rejects float values |
| Negative amount in database | Prevented by Zod validation: `z.number().min(1)` |
| Orphaned request claim race condition | `updateMany` with `WHERE recipientEmail = X AND recipientId IS NULL` is idempotent |

### 5.4 Authentication
| Scenario | Behavior |
|----------|----------|
| Magic link used after expiry | Error page: "This link has expired. Please request a new one." |
| Magic link used twice | Second use: error if token already consumed |
| User deletes account (future) | Out of scope for v1 |

---

## 6. Status State Machine

```
                    ┌──────────────────┐
         create()   │                  │   payRequest()
        ──────────► │    PENDING       │ ─────────────────► PAID
                    │                  │
                    └──┬─────┬─────┬───┘
                       │     │     │
       declineRequest()│     │     │ cancelRequest()
                       │     │     │
                       ▼     │     ▼
                  DECLINED   │   CANCELLED
                             │
                    expiresAt < now (check-on-read)
                             │
                             ▼
                          EXPIRED
```

### Transition Rules

| From | To | Trigger | Actor | Preconditions |
|------|----|---------|-------|---------------|
| (none) | PENDING | `createRequest()` | Sender | Valid inputs, not self-request |
| PENDING | PAID | `payRequest()` | Recipient | Request is PENDING, not expired, user is recipient |
| PENDING | DECLINED | `declineRequest()` | Recipient | Request is PENDING, user is recipient |
| PENDING | CANCELLED | `cancelRequest()` | Sender | Request is PENDING, user is sender |
| PENDING | EXPIRED | Check-on-read | System | `expiresAt < now` and status is still PENDING |

### Terminal States
- **PAID**: No further transitions. Permanent.
- **DECLINED**: No further transitions. Permanent.
- **CANCELLED**: No further transitions. Permanent.
- **EXPIRED**: No further transitions. Permanent.

### Invalid Transitions (Rejected)
- PAID → anything
- DECLINED → anything
- CANCELLED → anything
- EXPIRED → anything (including PAID — cannot pay expired request)
- PENDING → PAID (if expired)

---

## 7. Non-Functional Requirements

### 7.1 Performance
| Metric | Target |
|--------|--------|
| Page load (initial) | < 2 seconds (LCP) |
| Page navigation (client) | < 500ms |
| Server Action response | < 1 second (excluding simulated payment delay) |
| Dashboard with 100 requests | < 2 seconds |
| Search debounce | 300ms |

### 7.2 Scalability (v1)
- Target: 100 concurrent users
- Database: single PostgreSQL instance, indexed queries
- No caching layer required for v1

### 7.3 Data Retention
- Payment requests: retained indefinitely
- Sessions: 30-day expiry, cleaned up periodically
- Audit logs: retained indefinitely

### 7.4 Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 15+)
- Chrome for Android

### 7.5 Responsive Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, card-based, bottom navigation |
| Tablet | 768px – 1024px | Two column where applicable, side navigation |
| Desktop | > 1024px | Full layout, sidebar navigation, table views |

### 7.6 Accessibility (WCAG 2.1 AA)
- All interactive elements keyboard accessible
- Focus indicators visible
- Color is not the only indicator of status (text labels always present)
- Form labels associated with inputs
- Error messages linked to form fields via `aria-describedby`
- Minimum contrast ratio 4.5:1 for text

---

## 8. Seed Data (Demo Environment)

### 8.1 Demo Users
| Email | Display Name | Role in Demo |
|-------|-------------|--------------|
| alice@demo.lovepay.com | Alice Johnson | Primary demo user (sender) |
| bob@demo.lovepay.com | Bob Smith | Secondary demo user (recipient) |
| carol@demo.lovepay.com | Carol Williams | Third user for variety |
| dave@demo.lovepay.com | Dave Brown | Fourth user (has expired requests) |

### 8.2 Demo Payment Requests
| Sender | Recipient | Amount | Note | Status | Created |
|--------|-----------|--------|------|--------|---------|
| Alice | Bob | $25.00 | Dinner split last Friday | PENDING | 2 days ago |
| Alice | Carol | $50.00 | Concert tickets | PAID | 5 days ago |
| Bob | Alice | $15.00 | Coffee and pastries | PENDING | 1 day ago |
| Carol | Alice | $100.00 | Rent share for March | DECLINED | 3 days ago |
| Dave | Alice | $75.00 | Group gift contribution | PENDING | 6 days ago (expires tomorrow) |
| Alice | Dave | $200.00 | Freelance work payment | EXPIRED | 10 days ago |
| Bob | Carol | $30.00 | Movie night snacks | PENDING | 4 hours ago |
| Carol | Bob | $45.00 | Uber ride split | CANCELLED | 2 days ago |
| Alice | Bob | $8.50 | Lunch yesterday | PENDING | 12 hours ago |
| Dave | Bob | $150.00 | Weekend trip expenses | PAID | 4 days ago |

### 8.3 Seed Data Purpose
- Reviewer can sign in as any demo user immediately
- Dashboard shows realistic data with all statuses
- Can test pay, decline, cancel flows without creating requests first
- Near-expiry request (Dave → Alice, 6 days ago) demonstrates countdown timer
- Already expired request demonstrates expired UI state
- README documents demo credentials and suggested test flow

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| Requester / Sender | The user who creates a payment request |
| Recipient / Payer | The user who is asked to pay |
| Payment Request | A record representing a request for money from one user to another |
| Shareable Link | A public URL containing a unique token that allows viewing a payment request |
| Shareable Token | A CUID used in the public URL, separate from the internal request ID |
| Integer Cents | Monetary values stored as integers (e.g., 2500 = $25.00) |
| Orphan Request | A request where the recipient email doesn't match any existing user account |
| Orphan Claim | The process of linking orphan requests to a user when they first sign in |
| Check-on-Read | Pattern where expiration is evaluated each time a request is read, instead of via cron |
| Magic Link | A one-time-use URL sent to the user's email for authentication |
| Terminal State | A status from which no further transitions are possible (PAID, DECLINED, CANCELLED, EXPIRED) |
