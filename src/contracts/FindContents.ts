import { type ContentsToFetch } from './ContentsToFetch.js';

export interface FindContents {
  find: () => Promise<ContentsToFetch[]>;
}
