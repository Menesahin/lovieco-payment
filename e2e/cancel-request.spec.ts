import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Cancel Request", () => {
  test("should show cancel button on outgoing pending request", async ({ page }) => {
    // Alice is sender of req_8 ($8.50 to Bob, PENDING)
    await loginAs(page, USERS.alice.email);
    await page.goto("/requests/req_8");

    await expect(page.getByText("$8.50")).toBeVisible();
    await expect(page.getByRole("button", { name: /cancel request/i })).toBeVisible();
  });

  test("should cancel request via confirmation dialog", async ({ page }) => {
    await loginAs(page, USERS.alice.email);
    await page.goto("/requests/req_8");

    // Click cancel
    await page.getByRole("button", { name: /cancel request/i }).click();

    // Confirmation dialog
    await expect(page.getByText("Cancel Payment Request")).toBeVisible();
    await expect(page.getByText(/cannot be undone/i)).toBeVisible();

    // Confirm cancel
    await page.getByRole("button", { name: "Yes, Cancel" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });
});
