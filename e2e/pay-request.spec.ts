import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Pay Request", () => {
  test("should show pay button on incoming pending request", async ({ page }) => {
    await loginAs(page, USERS.bob.email);
    await page.goto("/requests/req_1");

    await expect(page.locator("text=$25.00").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /pay/i }).first()).toBeVisible();
  });

  test("should show balance info on request detail", async ({ page }) => {
    await loginAs(page, USERS.bob.email);
    await page.goto("/requests/req_1");

    await expect(page.getByText(/your balance/i).first()).toBeVisible();
  });

  test("should complete full payment flow with confirmation", async ({ page }) => {
    await loginAs(page, USERS.bob.email);
    await page.goto("/requests/req_1");

    // Click pay button
    await page.getByRole("button", { name: /pay \$/i }).first().click();

    // Confirmation dialog should appear
    await expect(page.getByRole("heading", { name: "Confirm Payment" })).toBeVisible();
    await expect(page.getByText(/Pay \$25\.00 to/i)).toBeVisible();

    // Confirm payment
    await page.getByRole("button", { name: "Confirm Payment" }).click();

    // Wait for payment processing (2.5s simulation) and success
    await expect(page.getByRole("heading", { name: "Payment Successful" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("$25.00")).toBeVisible();
    await expect(page.getByText(/back to dashboard/i)).toBeVisible();
  });
});
