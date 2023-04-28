import puppeteer from 'puppeteer';
import { SlotCatalogContents } from './SlotCatalogContents.js';

const browser = await puppeteer.launch({
  headless: false,
});

const slotCatalogContents = new SlotCatalogContents(browser);
await slotCatalogContents.find();

await browser.close();
