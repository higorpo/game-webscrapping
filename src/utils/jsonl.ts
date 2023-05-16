import fs from 'fs';
import jsonl from 'jsonl';
import through from 'through2';
const stream = through.obj();

stream
  .pipe(jsonl({ toBufferStream: true }))
  .pipe(fs.createWriteStream('./dataset.json'));

export { stream };
