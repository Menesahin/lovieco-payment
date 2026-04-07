import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Pay Request", () => {
  test("should show pay button on incoming pending request", async ({ page }) => {
    await loginAs(page, USERS.bob.email);
    await page.goto("/requests/req_1");

    await expect(page.locator("text=$25.00").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /pay/i }).first()).toBeVisible();
  });

  test("should show balance info on request detail", async ({ page }) => {
    await loginAs(page, USERS.bob.email);
    await page.goto("/requests/req_1");

    await expect(page.getByText(/your balance/i).first()).toBeVisible();
  });
});
