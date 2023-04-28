import puppeteer, { type Page } from 'puppeteer';

async function main(): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto('https://slotcatalog.com/pt/The-Best-Slots?typ=2');

  let currentPage = 1;
  const maxPage = 35;
  const allElements: Array<{ href: string | undefined }> = [];

  while (currentPage < maxPage) {
    await awaitToCollectData(page);

    await page.evaluate(() => window.scrollTo({ top: 300 }));

    console.log('buscando dados!');

    await page.screenshot({ path: `tmp/selecting-${currentPage}.png` });

    const elements = await page.$$eval(
      '.providerCardOut > .providerCard',
      (elements) =>
        elements.map((element) => ({
          href:
            element.querySelector('a[href]')?.getAttribute('href') ?? undefined,
        })),
    );

    allElements.push(...elements);

    currentPage += 1;

    await page.waitForSelector(
      '.navpag > .navpag-center > .navpag-cont > ul > li:not(.active) > a',
    );

    await page.evaluate((currentPage) => {
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

  await browser.close();
}

async function awaitToCollectData(page: Page): Promise<void> {
  try {
    console.log('aguardando');
    await page.waitForSelector('.providerCardOut > .providerCard', {
      timeout: 5000,
    });
  } catch (e) {
    console.log('deu erro');
    await page.reload();
    await awaitToCollectData(page);
  }
}

await main();
