import { type Page, type Browser } from 'puppeteer';
import { type FindGameProperties } from './contracts/FindGameProperties.js';
import { type GameProperties } from './contracts/GameProperties.js';
import { waitForSelectorAndInternet } from './utils/internetErrorsHandler.js';

export class BwbGameProperties implements FindGameProperties {
  constructor(private readonly browser: Browser) {
    //
  }

  async find(
    pageUrl: string,
  ): Promise<GameProperties | Pick<GameProperties, 'link'>> {
    console.log(
      'Iniciando processo de busca de propriedades do jogo... URL: ',
      pageUrl,
    );
    const page = await this.browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54',
    );

    try {
      await page.goto(pageUrl);
    } catch (e) {
      console.log('Erro ao acessar a página: ', pageUrl);
      await page.close();
      return await this.find(pageUrl);
    }

    try {
      await waitForSelectorAndInternet(page, '.bwb-gsw-game-stats');
    } catch (error) {
      console.log('Erro ao acessar a página: ', pageUrl);
      await page.close();
      return {
        link: pageUrl,
      };
    }

    const gameProvider = await this.extractGameProvider(page);
    const gameReleaseDate = await this.extractGameReleaseDate(page);
    const gameVolatility = await this.extractGameVolatility(page);
    const gameTitle = await this.extractGameTitle(page);
    const gameMinMaxBet = await this.extractGameMinMaxBet(page);

    await page.close();

    return {
      link: pageUrl,
      provider: gameProvider,
      releaseDate: gameReleaseDate,
      gameVolatility,
      gameTitle,
      gameMinMaxBet,
    };
  }

  private async extractGameProvider(page: Page): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Developer:');
  }

  private async extractGameReleaseDate(
    page: Page,
  ): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Release Date:');
  }

  private async extractGameVolatility(page: Page): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Volatility:');
  }

  private async extractGameTitle(page: Page): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Title:');
  }

  private async extractGameMinMaxBet(page: Page): Promise<string | undefined> {
    return await this.extractAttributeReview(page, 'Min/Max Bet:');
  }

  private async extractAttributeReview(
    page: Page,
    searchAttribute: string,
  ): Promise<string | undefined> {
    await page.waitForSelector('.bwb-gsw-game-stats');

    return await page.evaluate((searchAttribute) => {
      return (
        Array.from(document.querySelectorAll('.bwb-gsw-game-stats ul li')).find(
          (element) =>
            element.querySelector('span')?.innerText === searchAttribute,
        ) as any
      )?.innerText.replace(searchAttribute + ' ', '');
    }, searchAttribute);
  }
}
