import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Decline Request", () => {
  test("should show decline button on incoming pending request", async ({ page }) => {
    // Alice has incoming pending request from Bob (req_5: $15)
    await loginAs(page, USERS.alice.email);
    await page.goto("/requests/req_5");

    await expect(page.getByText("$75.00", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Decline" })).toBeVisible();
  });

  test("should decline request via confirmation dialog", async ({ page }) => {
    await loginAs(page, USERS.alice.email);
    await page.goto("/requests/req_5");

    // Click decline
    await page.getByRole("button", { name: "Decline" }).click();

    // Confirmation dialog
    await expect(page.getByText("Decline Request")).toBeVisible();
    await expect(page.getByText(/decline this request from/i)).toBeVisible();

    // Confirm decline
    await page.getByRole("button", { name: "Yes, Decline" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });
});
