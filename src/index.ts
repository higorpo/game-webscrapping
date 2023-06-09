import puppeteer from 'puppeteer';
import { SaveGamePropertiesInJson } from './SaveGamePropertiesInJson.js';
import { chunk } from './utils/chunknize.js';
import { stream } from './utils/jsonl.js';
import { BwbContents } from './BwbContents.js';
import { BwbGameProperties } from './BwbGameProperties.js';
import { SlotCatalogContents } from './SlotCatalogContents.js';
import { SlotCatalogGameProperties } from './SlotCatalogGameProperties.js';

console.log('Iniciando processo de scrapping...');

const browser = await puppeteer.launch({
  headless: true,
});

const slotCatalogContents = new SlotCatalogContents(browser);
const contents = await slotCatalogContents.find();

console.log('Quantidade de conteúdos encontrados: ', contents.length);

const chunks = chunk(contents, 50);

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

const bwbContents = new BwbContents(browser);
const foundBwbContent = await bwbContents.find();

console.log('Quantidade de conteúdos encontrados: ', foundBwbContent.length);

const bwbChunks = chunk(foundBwbContent, 50);

for (const chunk of bwbChunks) {
  await Promise.all(
    chunk.map(async (content) => {
      return await new Promise((resolve, reject) => {
        const bwbGameProperties = new BwbGameProperties(browser);

        bwbGameProperties
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
