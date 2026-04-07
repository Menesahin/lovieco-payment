import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth";
import { USERS } from "../helpers/seed";

test.describe("Decline & Cancel Flows", () => {
  test("Alice declines a request, then creates and cancels her own", async ({ page }) => {
    // ─── ACT 1: Alice declines Bob's coffee request ───
    await loginAs(page, USERS.alice.email);
    await page.waitForTimeout(800);

    // Navigate to Bob's pending request (req_3: $15 Coffee)
    await page.goto("/requests/req_3");
    await expect(page.getByText("$15.00").first()).toBeVisible();
    await expect(page.getByText("Coffee").first()).toBeVisible();
    await page.waitForTimeout(800);

    // Decline
    await page.getByRole("button", { name: /decline/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /yes, decline/i }).click();
    await page.waitForTimeout(1500);

    // Should redirect to dashboard with declined status
    await expect(page.getByText("Declined").first()).toBeVisible();
    await page.waitForTimeout(800);

    // ─── ACT 2: Alice creates a request then cancels it ───
    await page.getByRole("link", { name: /new request/i }).first().click();
    await page.waitForURL("/requests/new");
    await page.waitForTimeout(500);

    await page.getByPlaceholder("recipient@example.com").fill(USERS.carol.email);
    await page.getByPlaceholder("0.00").fill("20");
    await page.getByPlaceholder(/what's this for/i).fill("Test request to cancel");
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: /send payment request/i }).click();
    await page.waitForURL(/\/requests\//);
    await expect(page.getByText("$20.00").first()).toBeVisible();
    await expect(page.getByText("Pending").first()).toBeVisible();
    await page.waitForTimeout(800);

    // Cancel the request
    await page.getByRole("button", { name: /cancel request/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /yes, cancel/i }).click();
    await page.waitForTimeout(1500);

    // Verify cancelled
    await expect(page.getByText("Cancelled").first()).toBeVisible();
    await page.waitForTimeout(800);
  });
});
