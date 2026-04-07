import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { USERS } from "./helpers/seed";

test.describe("Request Expiration", () => {
  test("should show expired status and warning message", async ({ page }) => {
    // Dave is recipient of req_6 ($200 from Alice, EXPIRED)
    await loginAs(page, USERS.dave.email);
    await page.goto("/requests/req_6");

    await expect(page.getByText("$200.00")).toBeVisible();
    await expect(page.getByText("Expired", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/expired and can no longer be paid/i)).toBeVisible();
  });

  test("should not show pay button on expired request", async ({ page }) => {
    await loginAs(page, USERS.dave.email);
    await page.goto("/requests/req_6");

    // Pay button should not exist for expired requests
    await expect(page.getByRole("button", { name: /pay/i })).toHaveCount(0);
  });
});
