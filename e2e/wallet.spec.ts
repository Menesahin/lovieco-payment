import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Wallet", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.alice.email);
    await page.goto("/wallet");
  });

  test("should show balance card", async ({ page }) => {
    await expect(page.getByText("Balance").first()).toBeVisible();
    await expect(page.getByText(/\$\d/).first()).toBeVisible();
  });

  test("should show transaction history", async ({ page }) => {
    await expect(page.getByText("Transactions")).toBeVisible();
  });

  test("should filter transactions by type", async ({ page }) => {
    await page.getByRole("link", { name: "Top Up" }).click();
    await expect(page).toHaveURL(/type=TOPUP/);
  });

  test("should show topup modal", async ({ page }) => {
    await page.locator("span.cursor-pointer").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
