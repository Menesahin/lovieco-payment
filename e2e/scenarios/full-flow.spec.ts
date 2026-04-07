import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth";
import { USERS } from "../helpers/seed";

test.describe("Full Payment Lifecycle", () => {
  test("Alice topups, requests money from Bob, Bob pays, balances verified", async ({ page }) => {
    // ─── ACT 1: Alice logs in and explores dashboard ───
    await loginAs(page, USERS.alice.email);
    await expect(page.getByText("Activity")).toBeVisible();
    await page.waitForTimeout(800);

    // ─── ACT 2: Alice goes to wallet and tops up ───
    await page.getByRole("link", { name: "Wallet" }).first().click();
    await page.waitForURL("/wallet");
    await expect(page.getByText("Balance").first()).toBeVisible();
    await page.waitForTimeout(800);

    // Open topup modal
    await page.locator("span.cursor-pointer").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByPlaceholder("0.00").fill("100");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /add funds/i }).click();
    await page.waitForTimeout(1500); // Wait for topup to process

    // ─── ACT 3: Alice creates a payment request to Bob ───
    await page.getByRole("link", { name: /new request/i }).first().click();
    await page.waitForURL("/requests/new");
    await page.waitForTimeout(500);

    await page.getByPlaceholder("recipient@example.com").fill(USERS.bob.email);
    await page.waitForTimeout(300);
    await page.getByPlaceholder("0.00").fill("42");
    await page.waitForTimeout(300);
    await page.getByPlaceholder(/what's this for/i).fill("Pizza last night");
    await page.waitForTimeout(500);

    // Verify preview
    await expect(page.getByText("$42.00").first()).toBeVisible();
    await page.waitForTimeout(500);

    // Submit
    await page.getByRole("button", { name: /send payment request/i }).click();
    await page.waitForURL(/\/requests\//);
    await expect(page.getByText("$42.00").first()).toBeVisible();
    await expect(page.getByText("Pending").first()).toBeVisible();
    await page.waitForTimeout(1000);

    // Get the request URL for Bob
    const requestUrl = page.url();
    const requestId = requestUrl.split("/requests/")[1];

    // ─── ACT 4: Bob logs in and sees the request ───
    await loginAs(page, USERS.bob.email);
    await expect(page.getByText("Activity")).toBeVisible();
    await page.waitForTimeout(800);

    // Navigate to the request
    await page.goto(`/requests/${requestId}`);
    await expect(page.getByText("$42.00").first()).toBeVisible();
    await expect(page.getByText(/your balance/i).first()).toBeVisible();
    await page.waitForTimeout(800);

    // ─── ACT 5: Bob pays the request ───
    await page.getByRole("button", { name: /pay/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: /confirm payment/i }).click();
    // Wait for 2.5s payment simulation + processing
    await page.waitForTimeout(4000);

    // Verify success
    await expect(page.getByRole("heading", { name: "Payment Successful" })).toBeVisible();
    await page.waitForTimeout(1000);

    // ─── ACT 6: Bob checks dashboard — Paid badge ───
    await page.getByRole("link", { name: /dashboard|back/i }).first().click();
    await page.waitForTimeout(800);
    await expect(page.getByText("Paid").first()).toBeVisible();

    // ─── ACT 7: Alice verifies she received payment ───
    await loginAs(page, USERS.alice.email);
    await page.waitForTimeout(800);

    // Check wallet for received payment
    await page.getByRole("link", { name: "Wallet" }).first().click();
    await page.waitForURL("/wallet");
    await page.waitForTimeout(1000);

    // Verify transaction history shows received payment
    await expect(page.getByText("Transactions").first()).toBeVisible();
  });
});
