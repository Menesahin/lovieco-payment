import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Responsive Design", () => {
  test("should show sidebar on desktop", async ({ page }) => {
    // Desktop viewport (default)
    await loginAs(page, USERS.alice.email);
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("should show bottom nav on mobile", async ({ page }) => {
    // Use mobile project config (iPhone 14)
    test.skip(test.info().project.name !== "mobile", "Mobile only");
    await loginAs(page, USERS.alice.email);
    const bottomNav = page.locator("nav.fixed.bottom-0");
    await expect(bottomNav).toBeVisible();
  });
});
