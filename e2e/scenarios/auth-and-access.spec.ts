import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth";
import { USERS } from "../helpers/seed";

test.describe("Auth Guards & Access Control", () => {
  test("protected routes redirect, shareable link access control works", async ({ page }) => {
    // ─── ACT 1: Unauthenticated access attempts ───
    await page.goto("/dashboard");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/sign-in/);
    await page.waitForTimeout(800);

    await page.goto("/requests/new");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/sign-in/);
    await page.waitForTimeout(800);

    await page.goto("/wallet");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/sign-in/);
    await page.waitForTimeout(800);

    // ─── ACT 2: Shareable link — unauthenticated ───
    await page.goto("/r/share_1");
    await page.waitForTimeout(500);
    await expect(page.getByText(/sign in/i).first()).toBeVisible();
    await page.waitForTimeout(800);

    // ─── ACT 3: Shareable link — Alice (sender, involved) ───
    await loginAs(page, USERS.alice.email);
    await page.goto("/r/share_1");
    await page.waitForTimeout(500);
    // Should redirect to request detail
    await expect(page).toHaveURL(/\/requests\/req_1/);
    await expect(page.getByText("$25.00").first()).toBeVisible();
    await page.waitForTimeout(800);

    // ─── ACT 4: Shareable link — Carol (not involved) ───
    await loginAs(page, USERS.carol.email);
    await page.goto("/r/share_1");
    await page.waitForTimeout(500);
    await expect(page.getByText(/restricted|not found/i).first()).toBeVisible();
    await page.waitForTimeout(800);

    // ─── ACT 5: Landing page for unauthenticated ───
    // Clear cookies to logout
    await page.context().clearCookies();
    await page.goto("/");
    await page.waitForTimeout(500);
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await page.waitForTimeout(800);
  });
});
