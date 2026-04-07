# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scenarios/decline-cancel-flow.spec.ts >> Decline & Cancel Flows >> Alice declines a request, then creates and cancels her own
- Location: e2e/scenarios/decline-cancel-flow.spec.ts:6:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /decline/i }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e6]: L
        - generic [ref=e7]: Lovie.co
      - navigation [ref=e8]:
        - link "Dashboard" [ref=e9] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e10]
          - text: Dashboard
        - link "New Request" [ref=e13] [cursor=pointer]:
          - /url: /requests/new
          - img [ref=e14]
          - text: New Request
        - link "Wallet" [ref=e16] [cursor=pointer]:
          - /url: /wallet
          - img [ref=e17]
          - text: Wallet
        - link "Settings" [ref=e20] [cursor=pointer]:
          - /url: /settings
          - img [ref=e21]
          - text: Settings
      - link "A Alice Johnson View settings" [ref=e25] [cursor=pointer]:
        - /url: /settings
        - generic [ref=e27]: A
        - generic [ref=e28]:
          - paragraph [ref=e29]: Alice Johnson
          - paragraph [ref=e30]: View settings
    - generic [ref=e31]:
      - banner [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]:
              - paragraph [ref=e36]: Balance
              - paragraph [ref=e37]: $392.00
            - button [ref=e38]:
              - img [ref=e40] [cursor=pointer]
          - generic [ref=e41]:
            - generic [ref=e43]: A
            - generic [ref=e44]: Alice Johnson
          - button "Sign Out" [ref=e46]
      - main [ref=e47]:
        - generic [ref=e48]:
          - link "Back to Dashboard" [ref=e49] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e50]
            - text: Back to Dashboard
          - generic [ref=e52]:
            - generic [ref=e53]:
              - generic [ref=e54]: $15.00
              - generic [ref=e55]: Declined
            - generic [ref=e57]:
              - generic [ref=e58]:
                - generic [ref=e59]: From
                - generic [ref=e60]: Bob Smith
              - generic [ref=e61]:
                - generic [ref=e62]: Note
                - generic [ref=e63]: Coffee and pastries
              - generic [ref=e64]:
                - generic [ref=e65]: Created
                - generic [ref=e66]: April 6, 2026
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e72] [cursor=pointer]:
    - img [ref=e73]
  - alert [ref=e76]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAs } from "../helpers/auth";
  3  | import { USERS } from "../helpers/seed";
  4  | 
  5  | test.describe("Decline & Cancel Flows", () => {
  6  |   test("Alice declines a request, then creates and cancels her own", async ({ page }) => {
  7  |     // ─── ACT 1: Alice declines Bob's coffee request ───
  8  |     await loginAs(page, USERS.alice.email);
  9  |     await page.waitForTimeout(800);
  10 | 
  11 |     // Navigate to Bob's pending request (req_3: $15 Coffee)
  12 |     await page.goto("/requests/req_3");
  13 |     await expect(page.getByText("$15.00").first()).toBeVisible();
  14 |     await expect(page.getByText("Coffee").first()).toBeVisible();
  15 |     await page.waitForTimeout(800);
  16 | 
  17 |     // Decline
> 18 |     await page.getByRole("button", { name: /decline/i }).first().click();
     |                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  19 |     await expect(page.getByRole("dialog")).toBeVisible();
  20 |     await page.waitForTimeout(500);
  21 |     await page.getByRole("button", { name: /yes, decline/i }).click();
  22 |     await page.waitForTimeout(1500);
  23 | 
  24 |     // Should redirect to dashboard with declined status
  25 |     await expect(page.getByText("Declined").first()).toBeVisible();
  26 |     await page.waitForTimeout(800);
  27 | 
  28 |     // ─── ACT 2: Alice creates a request then cancels it ───
  29 |     await page.getByRole("link", { name: /new request/i }).first().click();
  30 |     await page.waitForURL("/requests/new");
  31 |     await page.waitForTimeout(500);
  32 | 
  33 |     await page.getByPlaceholder("recipient@example.com").fill(USERS.carol.email);
  34 |     await page.getByPlaceholder("0.00").fill("20");
  35 |     await page.getByPlaceholder(/what's this for/i).fill("Test request to cancel");
  36 |     await page.waitForTimeout(500);
  37 | 
  38 |     await page.getByRole("button", { name: /send payment request/i }).click();
  39 |     await page.waitForURL(/\/requests\//);
  40 |     await expect(page.getByText("$20.00").first()).toBeVisible();
  41 |     await expect(page.getByText("Pending").first()).toBeVisible();
  42 |     await page.waitForTimeout(800);
  43 | 
  44 |     // Cancel the request
  45 |     await page.getByRole("button", { name: /cancel request/i }).click();
  46 |     await expect(page.getByRole("dialog")).toBeVisible();
  47 |     await page.waitForTimeout(500);
  48 |     await page.getByRole("button", { name: /yes, cancel/i }).click();
  49 |     await page.waitForTimeout(1500);
  50 | 
  51 |     // Verify cancelled
  52 |     await expect(page.getByText("Cancelled").first()).toBeVisible();
  53 |     await page.waitForTimeout(800);
  54 |   });
  55 | });
  56 | 
```