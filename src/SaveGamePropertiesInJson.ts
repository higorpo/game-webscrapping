import { type GameProperties } from './contracts/GameProperties.js';
import { type SaveGameProperties } from './contracts/SaveGameProperties.js';
import { stream } from './utils/jsonl.js';

export class SaveGamePropertiesInJson implements SaveGameProperties {
  save(gameProperties: GameProperties): void {
    console.log('Salvando propriedades do jogo... URL: ', gameProperties.link);
    stream.push(gameProperties);
  }
}
