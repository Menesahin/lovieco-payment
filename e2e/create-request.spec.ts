import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Create Payment Request", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.alice.email);
    await page.goto("/requests/new");
  });

  test("should show create request form", async ({ page }) => {
    await expect(page.getByText("New Payment Request")).toBeVisible();
    await expect(page.getByPlaceholder("recipient@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("0.00")).toBeVisible();
  });

  test("should create request with valid inputs", async ({ page }) => {
    await page.getByPlaceholder("recipient@example.com").fill(USERS.bob.email);
    await page.getByPlaceholder("0.00").fill("42.00");
    await page.getByPlaceholder(/what's this for/i).fill("Test request from E2E");
    await page.getByRole("button", { name: /send payment request/i }).click();

    // Should redirect to request detail
    await expect(page).toHaveURL(/\/requests\//);
    await expect(page.getByText("$42.00")).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.getByPlaceholder("0.00").fill("10.00");
    await page.getByRole("button", { name: /send payment request/i }).click();
    // HTML5 validation prevents submission — email field required
    const emailInput = page.getByPlaceholder("recipient@example.com");
    await expect(emailInput).toHaveAttribute("required");
  });
});
