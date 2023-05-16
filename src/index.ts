import puppeteer from 'puppeteer';
import { SaveGamePropertiesInJson } from './SaveGamePropertiesInJson.js';
import { SlotCatalogContents } from './SlotCatalogContents.js';
import { SlotCatalogGameProperties } from './SlotCatalogGameProperties.js';
import { stream } from './utils/jsonl.js';

console.log('Iniciando processo de scrapping...');

const browser = await puppeteer.launch({
  headless: false,
});

const slotCatalogContents = new SlotCatalogContents(browser);
const contents = await slotCatalogContents.find();

const slotCatalogGameProperties = new SlotCatalogGameProperties(browser);
const data = await slotCatalogGameProperties.find(contents[0].link);

console.log(data);

const saveGamePropertiesInJson = new SaveGamePropertiesInJson();
saveGamePropertiesInJson.save(data);

await stream.end();
await browser.close();
