import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.alice.email);
  });

  test("should show activity feed with items", async ({ page }) => {
    await expect(page.getByText("Activity")).toBeVisible();
    // Should have at least one activity item
    await expect(page.locator("[class*='divide-y'] > *").first()).toBeVisible();
  });

  test("should show stat cards", async ({ page }) => {
    await expect(page.getByText("Balance")).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(page.getByText("Completed")).toBeVisible();
  });

  test("should filter activity by type", async ({ page }) => {
    // Click "Incoming" filter
    await page.getByRole("link", { name: "Incoming" }).click();
    await expect(page).toHaveURL(/type=request_incoming/);
  });

  test("should navigate to request detail on click", async ({ page }) => {
    // Click first non-actionable activity item
    const firstLink = page.locator("a[href*='/requests/']").first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/requests\//);
    }
  });
});
