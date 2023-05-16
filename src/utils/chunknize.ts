import { type ContentsToFetch } from '../contracts/ContentsToFetch.js';

export function chunk(
  arr: ContentsToFetch[],
  chunkSize: number,
): ContentsToFetch[][] {
  if (chunkSize <= 0) throw Error('Invalid chunk size');
  const R = [];
  for (let i = 0, len = arr.length; i < len; i += chunkSize)
    R.push(arr.slice(i, i + chunkSize) as never);
  return R;
}
