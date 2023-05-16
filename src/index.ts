import puppeteer from 'puppeteer';
import { SaveGamePropertiesInJson } from './SaveGamePropertiesInJson.js';
import { SlotCatalogContents } from './SlotCatalogContents.js';
import { SlotCatalogGameProperties } from './SlotCatalogGameProperties.js';
import { chunk } from './utils/chunknize.js';
import { stream } from './utils/jsonl.js';

console.log('Iniciando processo de scrapping...');

const browser = await puppeteer.launch({
  headless: false,
});

const slotCatalogContents = new SlotCatalogContents(browser);
const contents = await slotCatalogContents.find();

const chunks = chunk(contents, 20);

for (const chunk of chunks) {
  await Promise.all(
    chunk.map(async (content) => {
      return await new Promise((resolve, reject) => {
        const slotCatalogGameProperties = new SlotCatalogGameProperties(
          browser,
        );

        slotCatalogGameProperties
          .find(content.link)
          .then((data) => {
            const saveGamePropertiesInJson = new SaveGamePropertiesInJson();
            saveGamePropertiesInJson.save(data);
            resolve(data);
          })
          .catch((e) => {
            reject(e);
          });
      });
    }),
  );
}

await stream.end();
await browser.close();
