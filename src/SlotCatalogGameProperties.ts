import { type Page, type Browser } from 'puppeteer';
import { type FindGameProperties } from './contracts/FindGameProperties.js';
import { type GameProperties } from './contracts/GameProperties.js';
import { waitForSelectorAndInternet } from './utils/internetErrorsHandler.js';

export class SlotCatalogGameProperties implements FindGameProperties {
  constructor(private readonly browser: Browser) {
    //
  }

  async find(pageUrl: string): Promise<GameProperties> {
    console.log(
      'Iniciando processo de busca de propriedades do jogo... URL: ',
      pageUrl,
    );
    const page = await this.browser.newPage();

    try {
      await page.goto(pageUrl);
    } catch (e) {
      console.log('Erro ao acessar a página: ', pageUrl);
      await page.close();
      return await this.find(pageUrl);
    }

    await waitForSelectorAndInternet(page, '.mainTitle');

    const gameLogoUrl = await this.extractGameLogo(page);
    const gameProvider = await this.extractGameProvider(page);
    const gameReleaseDate = await this.extractGameReleaseDate(page);
    const gameTechnology = await this.extractGameTechnology(page);
    const gameSize = await this.extractGameSize(page);

    await page.close();

    return {
      link: pageUrl,
      imageUrl: gameLogoUrl,
      provider: gameProvider,
      releaseDate: gameReleaseDate,
      gameTechnology,
      gameSize,
    };
  }

  private async extractGameLogo(page: Page): Promise<string | undefined> {
    await page.waitForSelector('.gemeLogoImg');

    return await page.evaluate(() => {
      const value = document
        .querySelector('.gemeLogoImg > a > img')
        ?.getAttribute('src');
      console.log(document.querySelector('.gemeLogoImg > a > img')); // for some reason it only works if I log this
      return value ?? undefined;
    });
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

    return await page.evaluate((searchAttribute) => {
      return Array.from(document.querySelectorAll('.slotAttrReview tr'))
        .find(
          (element) =>
            element.querySelector('th')?.innerText === searchAttribute,
        )
        ?.querySelector('td')?.innerText;
    }, searchAttribute);
  }
}
