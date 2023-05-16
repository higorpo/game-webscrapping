import { type GameProperties } from './GameProperties.js';

export interface SaveGameProperties {
  save: (gameProperties: GameProperties) => void;
}
