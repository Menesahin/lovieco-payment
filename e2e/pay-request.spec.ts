import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Pay Request", () => {
  test("should show pay button on incoming pending request", async ({ page }) => {
    // Login as Bob (has incoming pending request from Alice)
    await loginAs(page, USERS.bob.email);

    // Navigate to Alice's request (req_1: $25 dinner split)
    await page.goto("/requests/req_1");

    await expect(page.getByText("$25.00")).toBeVisible();
    await expect(page.getByRole("button", { name: /pay/i })).toBeVisible();
  });

  test("should show balance on request detail", async ({ page }) => {
    await loginAs(page, USERS.bob.email);
    await page.goto("/requests/req_1");

    await expect(page.getByText(/balance/i)).toBeVisible();
  });
});
