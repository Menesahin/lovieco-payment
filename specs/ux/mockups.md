# UI Mockups

> ASCII wireframes for all LovePay screens
> Responsive: Desktop (>1024px) and Mobile (<768px) variants
> Last updated: 2026-04-07

---

## 1. Landing Page

### Desktop
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   LovePay                                          [Sign In]    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│              Request money from anyone,                          │
│                    hassle-free.                                  │
│                                                                  │
│         Send payment requests via email and get paid             │
│         faster. Simple, secure, and instant.                     │
│                                                                  │
│                  [ Get Started ]                                 │
│                                                                  │
│                                                                  │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│   │                 │ │                 │ │                 │  │
│   │   Send Request  │ │  Track Status   │ │   Pay Easily    │  │
│   │   in seconds    │ │  in real-time   │ │   with 1 click  │  │
│   │                 │ │                 │ │                 │  │
│   │  Create a       │ │  See pending,   │ │  Open the       │  │
│   │  payment        │ │  paid, and      │ │  request and    │  │
│   │  request with   │ │  expired        │ │  pay instantly  │  │
│   │  just an email  │ │  requests at    │ │  with a single  │  │
│   │  and amount.    │ │  a glance.      │ │  confirmation.  │  │
│   │                 │ │                 │ │                 │  │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│   LovePay · Built with Next.js · 2026                           │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌────────────────────────────┐
│  LovePay          [Sign In]│
├────────────────────────────┤
│                             │
│    Request money from       │
│    anyone, hassle-free.     │
│                             │
│    Send payment requests    │
│    via email and get paid   │
│    faster.                  │
│                             │
│    [ Get Started ]          │
│                             │
│  ┌────────────────────────┐│
│  │  Send Request          ││
│  │  in seconds            ││
│  │  Create a payment...   ││
│  └────────────────────────┘│
│  ┌────────────────────────┐│
│  │  Track Status          ││
│  │  in real-time          ││
│  │  See pending, paid...  ││
│  └────────────────────────┘│
│  ┌────────────────────────┐│
│  │  Pay Easily            ││
│  │  with 1 click          ││
│  │  Open the request...   ││
│  └────────────────────────┘│
│                             │
└────────────────────────────┘
```

---

## 2. Sign In Page

### Desktop
```
┌─────────────────────────────────────────────────────────────────┐
│   LovePay                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                  ┌────────────────────────────┐                  │
│                  │                            │                  │
│                  │      Welcome back          │                  │
│                  │                            │                  │
│                  │   Sign in with your email  │                  │
│                  │   to continue              │                  │
│                  │                            │                  │
│                  │   Email address            │                  │
│                  │   ┌──────────────────────┐ │                  │
│                  │   │ you@example.com      │ │                  │
│                  │   └──────────────────────┘ │                  │
│                  │                            │                  │
│                  │   [ Send Magic Link ]      │                  │
│                  │                            │                  │
│                  │   We'll email you a link   │                  │
│                  │   to sign in. No password  │                  │
│                  │   needed.                  │                  │
│                  │                            │                  │
│                  └────────────────────────────┘                  │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Verify Request Page

```
┌─────────────────────────────────────────────────────────────────┐
│   LovePay                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                  ┌────────────────────────────┐                  │
│                  │                            │                  │
│                  │      Check your email      │                  │
│                  │                            │                  │
│                  │   We sent a sign-in link   │                  │
│                  │   to you@example.com       │                  │
│                  │                            │                  │
│                  │   Click the link in your   │                  │
│                  │   email to continue.       │                  │
│                  │                            │                  │
│                  │   ─────────────────────    │                  │
│                  │                            │                  │
│                  │   Didn't receive it?       │                  │
│                  │   [Resend] (disabled 58s)  │                  │
│                  │                            │                  │
│                  └────────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Dashboard

### Desktop
```
┌─────────────────────────────────────────────────────────────────────────┐
│  LovePay                                              Alice ▼  [Sign Out]│
├────────────┬────────────────────────────────────────────────────────────┤
│            │                                                            │
│  SIDEBAR   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐ │
│            │  │  Pending   │ │   Paid     │ │  Declined  │ │ Total  │ │
│  Dashboard │  │     5      │ │    12      │ │     2      │ │   22   │ │
│            │  │   amber    │ │   green    │ │    red     │ │  blue  │ │
│  + New     │  └────────────┘ └────────────┘ └────────────┘ └────────┘ │
│  Request   │                                                            │
│            │  ┌────────────────────────────────────────────────────┐    │
│  Settings  │  │  [■ Incoming]    [ Outgoing ]                     │    │
│            │  └────────────────────────────────────────────────────┘    │
│            │                                                            │
│            │  ┌─────────────────────────────┐  ┌───────────────────┐   │
│            │  │ 🔍 Search by name or email  │  │ All Statuses   ▼ │   │
│            │  └─────────────────────────────┘  └───────────────────┘   │
│            │                                                            │
│            │  ┌────────────────────────────────────────────────────┐    │
│            │  │ From              Amount   Note          Status  Date│  │
│            │  ├────────────────────────────────────────────────────┤    │
│            │  │ alice@mail.com   $25.00   Dinner split  🟡 Pend  2d│  │
│            │  │ bob@mail.com     $50.00   Rent share    🟢 Paid  5d│  │
│            │  │ carol@mail.com   $15.00   Coffee        🔴 Decl  3d│  │
│            │  │ dave@mail.com    $100.00  Tickets        🟡 Pend  6d│  │
│            │  │ eve@mail.com     $8.50    Lunch          ⚫ Exp   9d│  │
│            │  ├────────────────────────────────────────────────────┤    │
│            │  │              Showing 1-5 of 5 requests             │    │
│            │  └────────────────────────────────────────────────────┘    │
│            │                                                            │
└────────────┴────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌────────────────────────────┐
│  LovePay         ☰    👤   │
├────────────────────────────┤
│                             │
│ ┌──────┐┌──────┐┌──────┐  │
│ │Pend. ││Paid  ││Total │  │
│ │  5   ││  12  ││  22  │  │
│ └──────┘└──────┘└──────┘  │
│                             │
│ [■ Incoming] [Outgoing]    │
│                             │
│ ┌────────────┐ ┌────────┐  │
│ │🔍 Search   │ │Filter ▼│  │
│ └────────────┘ └────────┘  │
│                             │
│ ┌──────────────────────────┐│
│ │ alice@mail.com           ││
│ │ $25.00 · Dinner split    ││
│ │ 🟡 Pending · 2 days ago  ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │ bob@mail.com             ││
│ │ $50.00 · Rent share      ││
│ │ 🟢 Paid · 5 days ago     ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │ carol@mail.com           ││
│ │ $15.00 · Coffee           ││
│ │ 🔴 Declined · 3 days ago ││
│ └──────────────────────────┘│
│                             │
│ ┌────┐  ┌────┐  ┌────┐    │
│ │ 🏠 │  │ ➕ │  │ ⚙️ │    │
│ └────┘  └────┘  └────┘    │
└────────────────────────────┘
```

### Dashboard — Empty State (Incoming)
```
┌────────────────────────────────────────────────────┐
│                                                     │
│  [■ Incoming]    [ Outgoing ]                      │
│                                                     │
│                                                     │
│                    📭                               │
│                                                     │
│        No payment requests yet.                    │
│                                                     │
│        When someone requests money from you,       │
│        it will appear here.                        │
│                                                     │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Dashboard — Empty State (Outgoing)
```
┌────────────────────────────────────────────────────┐
│                                                     │
│  [ Incoming ]    [■ Outgoing]                      │
│                                                     │
│                                                     │
│                    📤                               │
│                                                     │
│     You haven't sent any payment requests yet.     │
│                                                     │
│        [ Create your first request → ]             │
│                                                     │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Dashboard — No Search Results
```
┌────────────────────────────────────────────────────┐
│                                                     │
│  🔍 "alice"  ×                    [Pending ▼]      │
│                                                     │
│                                                     │
│                    🔍                               │
│                                                     │
│        No requests found for "alice".              │
│                                                     │
│        [Clear search]    [Clear filters]           │
│                                                     │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 5. Create Request Page

### Desktop
```
┌─────────────────────────────────────────────────────────────────┐
│  LovePay                                              Alice ▼   │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                     │
│  SIDEBAR   │  ← Back to Dashboard                               │
│            │                                                     │
│  Dashboard │  New Payment Request                                │
│            │  ─────────────────────────────────────              │
│  + New     │                                                     │
│  Request   │  Request money from someone by entering their      │
│            │  email address and the amount.                     │
│  Settings  │                                                     │
│            │  Recipient Email *                                  │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ recipient@example.com                        │  │
│            │  └──────────────────────────────────────────────┘  │
│            │  ⚠ Please enter a valid email address              │
│            │                                                     │
│            │  Amount *                                           │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ $  │ 25.00                                   │  │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                     │
│            │  Note (optional)                                    │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ Dinner last Friday at the Italian place      │  │
│            │  │                                              │  │
│            │  │                                              │  │
│            │  └──────────────────────────────────────────────┘  │
│            │  42/500 characters                                  │
│            │                                                     │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │           Send Payment Request               │  │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                     │
└────────────┴────────────────────────────────────────────────────┘
```

### Mobile
```
┌────────────────────────────┐
│  ← New Request       👤    │
├────────────────────────────┤
│                             │
│  Request money from         │
│  someone by entering their  │
│  email and amount.          │
│                             │
│  Recipient Email *          │
│  ┌────────────────────────┐│
│  │ email@example.com      ││
│  └────────────────────────┘│
│                             │
│  Amount *                   │
│  ┌────────────────────────┐│
│  │ $ │ 0.00               ││
│  └────────────────────────┘│
│                             │
│  Note (optional)            │
│  ┌────────────────────────┐│
│  │                        ││
│  │                        ││
│  └────────────────────────┘│
│  0/500                      │
│                             │
│  [  Send Payment Request  ]│
│                             │
│ ┌────┐  ┌────┐  ┌────┐    │
│ │ 🏠 │  │ ➕ │  │ ⚙️ │    │
│ └────┘  └────┘  └────┘    │
└────────────────────────────┘
```

---

## 6. Request Detail — Incoming (Can Pay)

### Desktop
```
┌─────────────────────────────────────────────────────────────────┐
│  LovePay                                              Alice ▼   │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                     │
│  SIDEBAR   │  ← Back to Dashboard                               │
│            │                                                     │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │                                              │  │
│            │  │               $25.00           🟡 Pending    │  │
│            │  │                                              │  │
│            │  │  ─────────────────────────────────────────   │  │
│            │  │                                              │  │
│            │  │  From          Alice Johnson                 │  │
│            │  │               alice@example.com              │  │
│            │  │                                              │  │
│            │  │  Note          Dinner last Friday at the     │  │
│            │  │               Italian place                  │  │
│            │  │                                              │  │
│            │  │  Created       April 7, 2026 at 2:30 PM     │  │
│            │  │                                              │  │
│            │  │  ─────────────────────────────────────────   │  │
│            │  │                                              │  │
│            │  │  ⏳ Expires in: 5 days, 14 hours             │  │
│            │  │  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  (28% elapsed)      │  │
│            │  │                                              │  │
│            │  │  ─────────────────────────────────────────   │  │
│            │  │                                              │  │
│            │  │  ┌─────────────────┐  ┌──────────────────┐  │  │
│            │  │  │   Pay $25.00    │  │     Decline      │  │  │
│            │  │  │  (green, solid) │  │  (gray, outline) │  │  │
│            │  │  └─────────────────┘  └──────────────────┘  │  │
│            │  │                                              │  │
│            │  └──────────────────────────────────────────────┘  │
│            │                                                     │
└────────────┴────────────────────────────────────────────────────┘
```

---

## 7. Request Detail — Outgoing (Can Cancel)

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│               $25.00                  🟡 Pending          │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  To            Bob Smith                                  │
│               bob@example.com                             │
│                                                           │
│  Note          Dinner last Friday                         │
│                                                           │
│  Created       April 7, 2026 at 2:30 PM                  │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ⏳ Expires in: 5 days, 14 hours                          │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  (28% elapsed)                   │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  Share this link with the recipient:                      │
│  ┌──────────────────────────────────────┐  ┌──────────┐ │
│  │ https://lovepay.com/r/clx1abc2de... │  │  Copy    │ │
│  └──────────────────────────────────────┘  └──────────┘ │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Cancel Request                         │  │
│  │            (red outline, destructive)               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Request Detail — Expired

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│               $100.00                 🔴 Expired          │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  From          Dave Brown                                 │
│               dave@example.com                            │
│                                                           │
│  Note          Concert tickets                            │
│                                                           │
│  Created       March 28, 2026                             │
│  Expired       April 4, 2026                              │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ⚠️  This request has expired and can no longer    │  │
│  │     be paid.                                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Pay $100.00    │  │       Dismiss                │  │
│  │  (DISABLED)     │  │    (outline, active)         │  │
│  └─────────────────┘  └──────────────────────────────┘  │
│                                                           │
│  [← Back to Dashboard]                                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Request Detail — Paid (Terminal)

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│               $25.00                  🟢 Paid             │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  From          Alice Johnson                              │
│               alice@example.com                           │
│                                                           │
│  Note          Dinner last Friday                         │
│                                                           │
│  Created       April 7, 2026 at 2:30 PM                  │
│                                                           │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ✓  You paid $25.00 on April 8, 2026 at 10:15 AM │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  [← Back to Dashboard]                                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Payment Processing States

### Step 1: Confirmation Dialog
```
┌──────────────────────────────────────┐
│                                       │
│         Confirm Payment               │
│                                       │
│   Pay $25.00 to alice@example.com?   │
│                                       │
│   This will complete the payment     │
│   request immediately.               │
│                                       │
│   ┌──────────────┐ ┌──────────────┐  │
│   │   Confirm    │ │    Cancel    │  │
│   │   Payment    │ │              │  │
│   │   (green)    │ │   (outline)  │  │
│   └──────────────┘ └──────────────┘  │
│                                       │
└──────────────────────────────────────┘
```

### Step 2: Processing (2-3 seconds)
```
┌──────────────────────────────────────┐
│                                       │
│               ⟳                       │
│        Processing payment...          │
│                                       │
│   Sending $25.00 to                  │
│   alice@example.com                  │
│                                       │
│   Please don't close this page.      │
│                                       │
└──────────────────────────────────────┘
```

### Step 3: Success
```
┌──────────────────────────────────────┐
│                                       │
│               ✓                       │
│       Payment Successful!             │
│                                       │
│   $25.00 sent to                     │
│   alice@example.com                  │
│                                       │
│   ┌──────────────────────────────┐   │
│   │      Back to Dashboard       │   │
│   └──────────────────────────────┘   │
│                                       │
└──────────────────────────────────────┘
```

---

## 11. Shareable Link Page (Not Authenticated)

```
┌─────────────────────────────────────────────────────────────────┐
│   LovePay                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                  ┌────────────────────────────┐                  │
│                  │                            │                  │
│                  │    Payment Request         │                  │
│                  │                            │                  │
│                  │       $25.00               │                  │
│                  │                            │                  │
│                  │  From: Alice Johnson       │                  │
│                  │  Note: Dinner last Friday  │                  │
│                  │  Status: 🟡 Pending        │                  │
│                  │                            │                  │
│                  │  ──────────────────────    │                  │
│                  │                            │                  │
│                  │  Sign in to pay or         │                  │
│                  │  decline this request.     │                  │
│                  │                            │                  │
│                  │  [ Sign in to pay → ]      │                  │
│                  │                            │                  │
│                  └────────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Confirmation Dialogs

### Decline Confirmation
```
┌──────────────────────────────────────┐
│                                       │
│         Decline Request               │
│                                       │
│   Decline this request from          │
│   alice@example.com for $25.00?      │
│                                       │
│   ┌──────────────┐ ┌──────────────┐  │
│   │ Yes, Decline │ │    Cancel    │  │
│   │   (red)      │ │  (outline)   │  │
│   └──────────────┘ └──────────────┘  │
│                                       │
└──────────────────────────────────────┘
```

### Cancel Request Confirmation
```
┌──────────────────────────────────────┐
│                                       │
│       Cancel Payment Request          │
│                                       │
│   Cancel this payment request?       │
│   This cannot be undone.             │
│                                       │
│   ┌──────────────┐ ┌──────────────┐  │
│   │  Yes, Cancel │ │   Go Back    │  │
│   │   (red)      │ │  (outline)   │  │
│   └──────────────┘ └──────────────┘  │
│                                       │
└──────────────────────────────────────┘
```

---

## Color & Badge Reference

| Status | Badge BG | Badge Text | Usage |
|--------|----------|------------|-------|
| Pending | `amber-100` | `amber-800` | Active, awaiting action |
| Paid | `green-100` | `green-800` | Successfully completed |
| Declined | `red-100` | `red-800` | Rejected by recipient |
| Cancelled | `gray-100` | `gray-800` | Withdrawn by sender |
| Expired | `red-200` | `red-900` | Time limit exceeded |

## Button Styles

| Button | Background | Text | Border | Usage |
|--------|-----------|------|--------|-------|
| Primary | `green-600` | White | None | Pay, Confirm, Get Started |
| Secondary | Transparent | `gray-700` | `gray-300` | Decline, Cancel dialog |
| Destructive | Transparent | `red-600` | `red-300` | Cancel Request |
| Disabled | `gray-100` | `gray-400` | None | Expired Pay button |
| Ghost | Transparent | `gray-600` | None | Back links, Dismiss |
