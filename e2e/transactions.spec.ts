import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openApp } from "./fixtures.ts";

async function openTransactions(page: Page) {
  await openApp(page);
  await page.getByRole("button", { name: /sign in to continue/i }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in" });
  await dialog.getByLabel("Account number").fill("12345678901234");
  await dialog.getByLabel("PIN", { exact: true }).fill("12345");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  // Arrive the way a user would: "View all" on the overview.
  await page.getByRole("link", { name: "View all" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Transactions" }),
  ).toBeVisible();
}

const rows = (page: Page) =>
  page.getByRole("region", { name: "All transactions" }).locator("tbody tr");
const pagination = (page: Page) =>
  page.getByRole("navigation", { name: "Pagination" });

test("pages through and filters transactions", async ({ page }) => {
  await openTransactions(page);
  await expect(rows(page)).toHaveCount(20);
  await expect(pagination(page).getByText(/^Showing 1–20 of/)).toBeVisible();

  await pagination(page).getByRole("button", { name: "Next page" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(pagination(page).getByText(/^Showing 21–40 of/)).toBeVisible();

  await page.getByRole("combobox", { name: "Category" }).selectOption("Dining");
  await expect(page).toHaveURL(/category=Dining/);
  await expect(page).not.toHaveURL(/page=/);
  await expect(pagination(page).getByText(/^Showing 1–/)).toBeVisible();

  await page
    .getByRole("combobox", { name: "Sort by" })
    .selectOption("amount_desc");
  await expect(page).toHaveURL(/sortBy=amount_desc/);
});

test("transactions page fits without scrolling sideways", async ({ page }) => {
  await openTransactions(page);
  await expect(rows(page)).toHaveCount(20);

  const pageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(pageOverflow).toBeLessThanOrEqual(0);
});

test("transactions page has no accessibility violations", async ({ page }) => {
  await openTransactions(page);
  await expect(rows(page)).toHaveCount(20);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
