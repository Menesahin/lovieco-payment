import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth";
import { USERS } from "../helpers/seed";

test.describe("Wallet Operations", () => {
  test("Dave tops up wallet and explores transaction history with filters", async ({ page }) => {
    // ─── ACT 1: Dave logs in and navigates to wallet ───
    await loginAs(page, USERS.dave.email);
    await page.waitForTimeout(800);

    await page.getByRole("link", { name: "Wallet" }).first().click();
    await page.waitForURL("/wallet");
    await page.waitForTimeout(800);

    // Verify balance is visible
    await expect(page.getByText("Balance").first()).toBeVisible();
    await expect(page.getByText(/\$\d/).first()).toBeVisible();
    await page.waitForTimeout(500);

    // ─── ACT 2: Top up $500 ───
    await page.locator("span.cursor-pointer").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(500);

    await page.getByPlaceholder("0.00").fill("500");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /add funds/i }).click();
    await page.waitForTimeout(2000); // Wait for topup

    // ─── ACT 3: Verify transaction in history ───
    await expect(page.getByText("Transactions").first()).toBeVisible();
    await page.waitForTimeout(800);

    // ─── ACT 4: Test filters ───
    // Filter: Top Up only
    await page.getByRole("link", { name: "Top Up" }).click();
    await expect(page).toHaveURL(/type=TOPUP/);
    await page.waitForTimeout(800);

    // Filter: Sent only
    await page.getByRole("link", { name: "Sent" }).click();
    await expect(page).toHaveURL(/type=PAYMENT_SENT/);
    await page.waitForTimeout(800);

    // Filter: Received only
    await page.getByRole("link", { name: "Received" }).click();
    await expect(page).toHaveURL(/type=PAYMENT_RECEIVED/);
    await page.waitForTimeout(800);

    // Back to All
    await page.getByRole("link", { name: "All", exact: true }).last().click();
    await page.waitForTimeout(800);

    // ─── ACT 5: Navigate to settings to verify balance appears there too ───
    await page.getByRole("link", { name: "Settings" }).first().click();
    await page.waitForURL("/settings");
    await expect(page.getByText(/balance/i).first()).toBeVisible();
    await page.waitForTimeout(800);
  });
});
