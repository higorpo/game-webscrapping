import { type Page, type Browser } from 'puppeteer';
import { type FindGameProperties } from './contracts/FindGameProperties.js';
import { type GameProperties } from './contracts/GameProperties.js';

export class SlotCatalogGameProperties implements FindGameProperties {
  constructor(private readonly browser: Browser) {
    //
  }

  async find(pageUrl: string): Promise<GameProperties> {
    const page = await this.browser.newPage();

    await page.goto(pageUrl);

    const gameLogoUrl = await this.extractGameLogo(page);
    const gameProvider = await this.extractGameProvider(page);
  }

  private async extractGameLogo(page: Page): Promise<string | undefined> {
    await page.waitForSelector('.gemeLogoImg');

    return await page.evaluate(
      () =>
        document.querySelector('.gemeLogoImg > a > img')?.getAttribute('src') ??
        undefined,
    );
  }

  private async extractGameProvider(page: Page): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Fornecedor:');
  }

  private async extractGameReleaseDate(
    page: Page,
  ): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Lançamento:');
  }

  private async extractGameTechnology(page: Page): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Tecnologia:');
  }

  private async extractGameSize(page: Page): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Tamanho do jogo:');
  }

  private async extractAttributeReview(
    page: Page,
    searchAttribute: string,
  ): Promise<string | undefined> {
    await page.waitForSelector('.slotAttrTop');

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.slotAttrReview tr'))
        .find(
          (element) =>
            element.querySelector('th')?.innerText === searchAttribute,
        )
        ?.querySelector('td')?.innerText;
    });
  }
}
