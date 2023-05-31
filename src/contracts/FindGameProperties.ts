import { type GameProperties } from './GameProperties.js';

export interface FindGameProperties {
  find: (
    pageUrl: string,
  ) => Promise<GameProperties | Pick<GameProperties, 'link'>>;
}
