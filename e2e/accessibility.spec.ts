import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Runs the full axe rule set in a real browser, including colour contrast,
// which jsdom-based component tests cannot evaluate.
test("landing page has no accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("sign in popup has no accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /sign in to continue/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(results.violations).toEqual([]);
});
