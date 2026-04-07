import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Wallet", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.alice.email);
    await page.goto("/wallet");
  });

  test("should show balance card", async ({ page }) => {
    await expect(page.getByText("Balance")).toBeVisible();
    await expect(page.getByText(/\$/)).toBeVisible();
  });

  test("should show transaction history", async ({ page }) => {
    await expect(page.getByText("Transactions")).toBeVisible();
  });

  test("should filter transactions by type", async ({ page }) => {
    await page.getByRole("link", { name: "Top Up" }).click();
    await expect(page).toHaveURL(/type=TOPUP/);
  });

  test("should show topup modal", async ({ page }) => {
    await page.locator("[class*='rounded-full'][class*='bg-emerald']").click();
    await expect(page.getByText("Add Funds")).toBeVisible();
  });
});
