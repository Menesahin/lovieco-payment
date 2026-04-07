import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Authentication", () => {
  test("should show sign-in page with email input", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByText("Welcome to")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  });

  test("should redirect unauthenticated user from dashboard to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("should login via dev-login and reach dashboard", async ({ page }) => {
    await loginAs(page, USERS.alice.email);
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Activity")).toBeVisible();
  });

  test("should show landing page for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
  });
});
