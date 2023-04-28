import { type Page } from 'puppeteer';

export async function waitForSelectorAndInternet(
  page: Page,
  selector: string,
): Promise<void> {
  try {
    await page.waitForSelector(selector, {
      timeout: 5000,
    });
  } catch (e) {
    await page.reload();
    await waitForSelectorAndInternet(page, selector);
  }
}
