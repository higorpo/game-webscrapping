import { type ContentsToFetch } from './contracts/ContentsToFetch.js';
import { type Page, type Browser } from 'puppeteer';
import { type FindContents } from './contracts/FindContents.js';
import { waitForSelectorAndInternet } from './utils/internetErrorsHandler.js';

export class SlotCatalogContents implements FindContents {
  private readonly MAX_PAGES_TO_VISIT = 35;

  private readonly SITE_URL = 'https://slotcatalog.com/pt/The-Best-Slots?typ=2';

  constructor(private readonly browser: Browser) {
    //
  }

  async find(): Promise<ContentsToFetch[]> {
    const page = await this.browser.newPage();

    await page.goto(this.SITE_URL);

    let currentPage = 1;
    const allContents: ContentsToFetch[] = [];

    while (currentPage < this.MAX_PAGES_TO_VISIT) {
      await waitForSelectorAndInternet(
        page,
        '.providerCardOut > .providerCard',
      );

      await page.evaluate(() => {
        window.scrollTo({ top: 600 });
      });

      await page.screenshot({ path: `tmp/selecting-${currentPage}.png` });

      const pageContents = await this.extractContents(page);
      allContents.push(...pageContents);

      currentPage += 1;
      await this.goToNextPage(page, currentPage);
    }

    await page.close();

    return allContents.map((content) => ({
      link: 'https://slotcatalog.com' + content.link,
    }));
  }

  private async extractContents(page: Page): Promise<ContentsToFetch[]> {
    return await page.$$eval(
      '.providerCardOut > .providerCard',
      (elements) =>
        elements
          .map((element) => ({
            link:
              element.querySelector('a[href]')?.getAttribute('href') ??
              undefined,
          }))
          .filter((element) => element.link !== undefined) as ContentsToFetch[],
    );
  }

  private async goToNextPage(page: Page, currentPage: number): Promise<void> {
    await page.waitForSelector(
      '.navpag > .navpag-center > .navpag-cont > ul > li:not(.active) > a',
    );

    await page.evaluate((currentPage: number) => {
      const button = Array.from(
        document.querySelectorAll(
          '.navpag > .navpag-center > .navpag-cont > ul > li:not(.active) > a',
        ),
      ).find((element) => element.innerHTML === `${currentPage}`) as
        | HTMLElement
        | undefined;

      button?.click();
    }, currentPage);
  }
}
