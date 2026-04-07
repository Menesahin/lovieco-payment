import { Page, expect } from "@playwright/test";

export async function loginAs(page: Page, email: string) {
  await page.goto(`/api/dev-login?email=${encodeURIComponent(email)}`);
  await page.waitForURL("/dashboard");
  await expect(page.locator("body")).toBeVisible();
}

export async function logout(page: Page) {
  // Click sign out button
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL("/");
}
