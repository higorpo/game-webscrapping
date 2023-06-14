import { type ContentsToFetch } from './contracts/ContentsToFetch.js';
import { type Page, type Browser } from 'puppeteer';
import { type FindContents } from './contracts/FindContents.js';
import { waitForSelectorAndInternet } from './utils/internetErrorsHandler.js';

export class BwbContents implements FindContents {
  private readonly MAX_PAGES_TO_VISIT = 10;

  private readonly SITE_URL =
    'https://www.bigwinboard.com/online-slot-reviews/';

  constructor(private readonly browser: Browser) {
    //
  }

  async find(): Promise<ContentsToFetch[]> {
    console.log('Iniciando processo de busca de conteúdos...');

    const page = await this.browser.newPage();

    try {
      await page.goto(this.SITE_URL);
    } catch (e) {
      console.log('Erro ao acessar a página de conteúdos');
      await page.close();
      return await this.find();
    }

    let currentPage = 1;
    const allContents: ContentsToFetch[] = [];

    while (currentPage < this.MAX_PAGES_TO_VISIT) {
      console.log('Buscando conteúdos da página ', currentPage);
      await waitForSelectorAndInternet(page, '.bwb-reviews-widget');

      await page.evaluate(() => {
        window.scrollTo({ top: 600 });
      });

      await page.screenshot({ path: `tmp/selecting-${currentPage}.png` });

      const pageContents = await this.extractContents(page);
      console.log(
        `Conteúdos encontrados na página ${currentPage}: ${pageContents.length}`,
      );

      allContents.push(...pageContents);

      currentPage += 1;
      await this.goToNextPage(page, currentPage);
    }

    await page.close();

    return allContents.map((content) => ({
      link: content.link,
    }));
  }

  private async extractContents(page: Page): Promise<ContentsToFetch[]> {
    return await page.$$eval(
      '.bwb-reviews-widget .post',
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
      '.bwb-reviews-widget__pagination > a.page-numbers',
    );

    await page.evaluate((currentPage: number) => {
      const button = Array.from(
        document.querySelectorAll(
          '.bwb-reviews-widget__pagination > a.page-numbers',
        ),
      ).find((element) => element.innerHTML === `${currentPage}`) as
        | HTMLElement
        | undefined;

      button?.click();
    }, currentPage);
  }
}
