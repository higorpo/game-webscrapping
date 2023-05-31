import { CannotFetchContentException } from './exceptions/CannotFetchContentException.js';
import { type Page } from 'puppeteer';

export async function waitForSelectorAndInternet(
  page: Page,
  selector: string,
  tries = 0,
): Promise<void> {
  try {
    await page.waitForSelector(selector, {
      timeout: 5000,
    });
  } catch (e) {
    if (tries === 5)
      throw new CannotFetchContentException('Cannot fetch content');

    await page.reload();
    await waitForSelectorAndInternet(page, selector, tries + 1);
  }
}
