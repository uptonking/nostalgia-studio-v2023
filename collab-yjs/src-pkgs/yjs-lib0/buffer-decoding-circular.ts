import { createDecoder, readAny } from './decoding';
import { createEncoder, toUint8Array, writeAny } from './encoding';

/**
 * Decode an any-encoded value.
 *
 * @param {Uint8Array} buf
 * @return {any}
 */
export const decodeAny = (buf) => readAny(createDecoder(buf));

/**
 * Encode anything as a UInt8Array. It's a pun on typescripts's `any` type.
 * See encoding.writeAny for more information.
 *
 * @param {any} data
 * @return {Uint8Array}
 */
export const encodeAny = (data) => {
  const encoder = createEncoder();
  writeAny(encoder, data);
  return toUint8Array(encoder);
};
