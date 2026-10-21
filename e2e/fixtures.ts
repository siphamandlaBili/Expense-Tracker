import { expect, type Page } from "@playwright/test";

/**
 * Opens the app and waits until it has rendered. The app renders only after
 * the mock service worker is running, so API calls made after this are mocked.
 */
export async function openApp(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}
