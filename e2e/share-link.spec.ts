import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Shareable Link", () => {
  test("should redirect unauthenticated user to sign-in", async ({ page }) => {
    await page.goto("/r/share_1");
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test("should redirect involved user to request detail", async ({ page }) => {
    await loginAs(page, USERS.bob.email);
    await page.goto("/r/share_1");
    // Should redirect to /requests/req_1
    await expect(page).toHaveURL(/\/requests\/req_1/);
  });

  test("should show access restricted for non-involved user", async ({ page }) => {
    await loginAs(page, USERS.carol.email);
    await page.goto("/r/share_1");
    await expect(page.getByText(/restricted|not found/i)).toBeVisible();
  });
});
