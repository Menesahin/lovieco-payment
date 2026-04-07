# E2E Test Scenarios — User Journey Documentation

> Automated screen recordings of complete user flows
> Each scenario produces a video in `test-results/`
> Run: `npx playwright test e2e/scenarios --project=chromium`

---

## Scenario 1: Full Payment Lifecycle (~19s)

**File:** `e2e/scenarios/full-flow.spec.ts`
**Video:** `test-results/scenarios-full-flow-*/video.webm`

**Story:** Alice tops up her wallet, sends a payment request to Bob, Bob pays it, both balances are verified.

```
ACT 1 — Alice logs in
  → /sign-in → dev-login → /dashboard
  → Sees activity feed, stat cards (Balance, Pending, Completed)

ACT 2 — Alice tops up wallet
  → Clicks "Wallet" in sidebar → /wallet
  → Opens topup modal → enters $100 → "Add Funds"
  → Balance increases

ACT 3 — Alice creates payment request
  → Clicks "New Request" → /requests/new
  → Fills: bob@demo.lovie.co, $42.00, "Pizza last night"
  → Sees live amount preview: $42.00
  → Submits → redirected to /requests/{id}
  → Sees: $42.00, Pending badge, countdown timer, share link

ACT 4 — Bob logs in and views request
  → dev-login as Bob → /dashboard
  → Navigates to /requests/{id}
  → Sees: $42.00, "Your balance: $500.00"

ACT 5 — Bob pays the request
  → Clicks "Pay $42.00" → confirmation dialog appears
  → Clicks "Confirm Payment" → 2.5s loading spinner
  → "Payment Successful" heading appears
  → $42.00 in emerald, "sent to alice@demo.lovie.co"

ACT 6 — Bob verifies dashboard
  → Clicks "Back to Dashboard"
  → Request shows "Paid" badge

ACT 7 — Alice verifies received payment
  → dev-login as Alice → /wallet
  → Transaction history shows received $42.00
```

**Verifies:** Request creation, payment simulation, atomic wallet transfer, both-side dashboard update, countdown timer, share link, confirmation dialog

---

## Scenario 2: Decline & Cancel Flow (~10s)

**File:** `e2e/scenarios/decline-cancel-flow.spec.ts`
**Video:** `test-results/scenarios-decline-cancel-*/video.webm`

**Story:** Alice declines an incoming request from Bob, then creates her own request and cancels it.

```
ACT 1 — Alice declines Bob's request
  → Login as Alice → /requests/req_3
  → Sees: $15.00, "Coffee and pastries", from Bob
  → Clicks "Decline" → confirmation dialog
  → Clicks "Yes, Decline" → redirect to dashboard
  → Request shows "Declined" badge

ACT 2 — Alice creates a request
  → Clicks "New Request" → /requests/new
  → Fills: carol@demo.lovie.co, $20.00, "Test request to cancel"
  → Submits → /requests/{id}
  → Sees: $20.00, Pending

ACT 3 — Alice cancels her own request
  → Clicks "Cancel Request" → confirmation dialog
  → Clicks "Yes, Cancel"
  → "Cancelled" badge visible
```

**Verifies:** Decline flow, cancel flow, confirmation dialogs, status badge updates, redirect behavior

---

## Scenario 3: Wallet Operations (~11s)

**File:** `e2e/scenarios/wallet-operations.spec.ts`
**Video:** `test-results/scenarios-wallet-operation-*/video.webm`

**Story:** Dave explores his wallet, tops up, reviews transaction history with filters.

```
ACT 1 — Dave navigates to wallet
  → Login as Dave → clicks "Wallet" → /wallet
  → Sees balance card ($750.00)

ACT 2 — Dave tops up $500
  → Clicks "+" button → topup modal opens
  → Enters $500 → "Add Funds"
  → Balance updates to $1,250.00

ACT 3 — Transaction history
  → Sees "Transactions" table
  → "Top Up +$500.00" visible in list

ACT 4 — Filter transactions
  → Clicks "Top Up" filter → URL: ?type=TOPUP
  → Clicks "Sent" filter → URL: ?type=PAYMENT_SENT
  → Clicks "Received" filter → URL: ?type=PAYMENT_RECEIVED
  → Clicks "All" → shows everything

ACT 5 — Settings verification
  → Clicks "Settings" → /settings
  → Balance visible in Wallet section
```

**Verifies:** Topup modal, atomic balance update, transaction history, filter pills, settings wallet display

---

## Scenario 4: Auth Guards & Access Control (~11s)

**File:** `e2e/scenarios/auth-and-access.spec.ts`
**Video:** `test-results/scenarios-auth-and-access-*/video.webm`

**Story:** Unauthenticated access attempts are blocked, shareable links have proper access control.

```
ACT 1 — Protected route guards
  → /dashboard → redirected to /sign-in
  → /requests/new → redirected to /sign-in
  → /wallet → redirected to /sign-in

ACT 2 — Shareable link (unauthenticated)
  → /r/share_1 → "Sign in to continue" page
  → No payment details exposed

ACT 3 — Shareable link (Alice — sender, involved)
  → Login as Alice → /r/share_1
  → Redirected to /requests/req_1
  → Sees $25.00 request detail

ACT 4 — Shareable link (Carol — not involved)
  → Login as Carol → /r/share_1
  → "Access Restricted" message
  → No payment details exposed

ACT 5 — Landing page
  → Clear cookies (logout)
  → / → "Sign In" button visible
```

**Verifies:** proxy.ts route protection, shareable link security (ADR-005), no data leakage to unauthorized users

---

## Scenario 5: Insufficient Funds Guard (~8s)

**File:** `e2e/scenarios/insufficient-funds.spec.ts`
**Video:** `test-results/scenarios-insufficient-fun-*/video.webm`

**Story:** Carol ($150 balance) tries to pay a $200 request — blocked by insufficient funds, tops up to unlock.

```
ACT 1 — Setup: Alice creates $200 request to Carol
  → Login as Alice → /requests/new
  → carol@demo.lovie.co, $200.00, "Expensive dinner test"
  → Submit → /requests/{id}

ACT 2 — Carol views the request
  → Login as Carol → /requests/{id}
  → Sees $200.00
  → "Insufficient funds" warning displayed
  → Pay button DISABLED (grayed out)

ACT 3 — Carol tops up to cover the amount
  → /wallet → topup $100 → balance $250
  → Back to /requests/{id}
  → Pay button now ENABLED
```

**Verifies:** Balance check before payment (inside Serializable transaction), disabled Pay UX, topup unlocks payment, CHECK constraint protection

---

## Test Data (Seed)

All scenarios run against seed data from `prisma/seed.ts`:

| User | Email | Balance | Role in Tests |
|------|-------|---------|---------------|
| Alice | alice@demo.lovie.co | $250.00 | Primary sender/requester |
| Bob | bob@demo.lovie.co | $500.00 | Primary payer |
| Carol | carol@demo.lovie.co | $150.00 | Insufficient funds test |
| Dave | dave@demo.lovie.co | $750.00 | Wallet operations test |

Pre-seeded requests: 10 (PENDING, PAID, DECLINED, CANCELLED, EXPIRED statuses)

---

## Running Tests

```bash
# Seed database (required before first run)
npx tsx prisma/seed.ts

# Run all scenario tests with video
npx playwright test e2e/scenarios --project=chromium

# Run specific scenario
npx playwright test e2e/scenarios/full-flow --project=chromium

# View HTML report with embedded videos
npx playwright show-report

# Videos saved to test-results/scenarios-*/video.webm
```
