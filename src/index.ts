import puppeteer from 'puppeteer';

async function main(): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto('https://google.com');

  await page.screenshot({ path: 'example.png' });

  await page.waitForTimeout(4000);

  await browser.close();
}

await main();
