import { type Id } from 'tinybase/src/common-d';

import { fromB64, isUndefined, stringHash, toB64 } from './common';

export type HlcParts = [
  logicalTime42: number,
  counter24: number,
  clientHash30: number,
];
export type Hlc = string;
// Sortable 16 digit radix-64(每6个二进制位代表代表一个编码) string representing 96 bits:
// - 42 bits (7 chars) for time in milliseconds (~139 years)
// - 24 bits (4 chars) for counter (~16 million)
// - 30 bits (5 chars) for hash of unique client id (~1 billion)

const SHIFT36 = 2 ** 36;
const SHIFT30 = 2 ** 30;
const SHIFT24 = 2 ** 24;
const SHIFT18 = 2 ** 18;
const SHIFT12 = 2 ** 12;
const SHIFT6 = 2 ** 6;

/** get 16-digit hybrid logical clock, time7 + counter4 + clientId5  */
export const encodeHlc = (
  logicalTime42: number,
  counter24: number,
  clientHash30: number,
): Hlc =>
  toB64(logicalTime42 / SHIFT36) +
  toB64(logicalTime42 / SHIFT30) +
  toB64(logicalTime42 / SHIFT24) +
  toB64(logicalTime42 / SHIFT18) +
  toB64(logicalTime42 / SHIFT12) +
  toB64(logicalTime42 / SHIFT6) +
  toB64(logicalTime42) +
  toB64(counter24 / SHIFT18) +
  toB64(counter24 / SHIFT12) +
  toB64(counter24 / SHIFT6) +
  toB64(counter24) +
  toB64(clientHash30 / SHIFT24) +
  toB64(clientHash30 / SHIFT18) +
  toB64(clientHash30 / SHIFT12) +
  toB64(clientHash30 / SHIFT6) +
  toB64(clientHash30);

const decodeHlc = (hlc16: Hlc): HlcParts => [
  fromB64(hlc16, 0) * SHIFT36 +
    fromB64(hlc16, 1) * SHIFT30 +
    fromB64(hlc16, 2) * SHIFT24 +
    fromB64(hlc16, 3) * SHIFT18 +
    fromB64(hlc16, 4) * SHIFT12 +
    fromB64(hlc16, 5) * SHIFT6 +
    fromB64(hlc16, 6),
  fromB64(hlc16, 7) * SHIFT18 +
    fromB64(hlc16, 8) * SHIFT12 +
    fromB64(hlc16, 9) * SHIFT6 +
    fromB64(hlc16, 10),
  fromB64(hlc16, 11) * SHIFT24 +
    fromB64(hlc16, 12) * SHIFT18 +
    fromB64(hlc16, 13) * SHIFT12 +
    fromB64(hlc16, 14) * SHIFT6 +
    fromB64(hlc16, 15),
];

export const getHlcFunctions = (
  uniqueId: Id,
  offset = 0,
): [() => Hlc, (remoteHlc: Hlc) => void] => {
  let logicalTime = 0;
  let counter = 0;
  const uniqueIdHash = stringHash(uniqueId);

  /** counter +1 */
  const getHlc = (): Hlc => {
    seenHlc();
    return encodeHlc(logicalTime, ++counter, uniqueIdHash);
  };

  /** use max counter */
  const seenHlc = (hlc?: Hlc): void => {
    const previousLogicalTime = logicalTime;
    const [remoteLogicalTime, remoteCounter] = isUndefined(hlc)
      ? [0, 0]
      : decodeHlc(hlc);

    logicalTime = Math.max(
      previousLogicalTime,
      remoteLogicalTime,
      Date.now() + offset,
    );

    counter =
      logicalTime == previousLogicalTime
        ? logicalTime == remoteLogicalTime
          ? Math.max(counter, remoteCounter)
          : counter
        : logicalTime == remoteLogicalTime
          ? remoteCounter
          : -1;
  };

  return [getHlc, seenHlc];
};
