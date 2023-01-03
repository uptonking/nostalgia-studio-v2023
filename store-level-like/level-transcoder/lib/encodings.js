import { Buffer } from 'buffer';

import { BufferFormat, UTF8Format, ViewFormat } from './formats';
import textEndec from './text-endec';

// const { Buffer } = require('buffer') || { Buffer: { isBuffer: () => false } }

const BufferWithFallback = Buffer || { isBuffer: () => false };

const { textEncoder, textDecoder } = textEndec();

/** @type {<T>(v: T) => v} */
const identity = (v) => v;

/**
 * @type {typeof import('./encodings').utf8}
 */
export const utf8 = new UTF8Format({
  encode: function (data) {
    // On node 16.9.1 buffer.toString() is 5x faster than TextDecoder
    return BufferWithFallback.isBuffer(data)
      ? data.toString('utf8')
      : ArrayBuffer.isView(data)
      ? textDecoder.decode(data)
      : String(data);
  },
  decode: identity,
  name: 'utf8',
  createViewTranscoder() {
    return new ViewFormat({
      encode: function (data) {
        return ArrayBuffer.isView(data) ? data : textEncoder.encode(data);
      },
      decode: function (data) {
        return textDecoder.decode(data);
      },
      name: `${this.name}+view`,
    });
  },
  createBufferTranscoder() {
    return new BufferFormat({
      encode: function (data) {
        return BufferWithFallback.isBuffer(data)
          ? data
          : ArrayBuffer.isView(data)
          ? BufferWithFallback.from(
              data.buffer,
              data.byteOffset,
              data.byteLength,
            )
          : BufferWithFallback.from(String(data), 'utf8');
      },
      decode: function (data) {
        return data.toString('utf8');
      },
      name: `${this.name}+buffer`,
    });
  },
});

/**
 * @type {typeof import('./encodings').json}
 */
export const json = new UTF8Format({
  encode: JSON.stringify,
  decode: JSON.parse,
  name: 'json',
});

/**
 * @type {typeof import('./encodings').buffer}
 */
export const buffer = new BufferFormat({
  encode: function (data) {
    return BufferWithFallback.isBuffer(data)
      ? data
      : ArrayBuffer.isView(data)
      ? BufferWithFallback.from(data.buffer, data.byteOffset, data.byteLength)
      : BufferWithFallback.from(String(data), 'utf8');
  },
  decode: identity,
  name: 'buffer',
  createViewTranscoder() {
    return new ViewFormat({
      encode: function (data) {
        return ArrayBuffer.isView(data)
          ? data
          : BufferWithFallback.from(String(data), 'utf8');
      },
      decode: function (data) {
        return BufferWithFallback.from(
          data.buffer,
          data.byteOffset,
          data.byteLength,
        );
      },
      name: `${this.name}+view`,
    });
  },
});

/**
 * @type {typeof import('./encodings').view}
 */
export const view = new ViewFormat({
  encode: function (data) {
    return ArrayBuffer.isView(data) ? data : textEncoder.encode(data);
  },
  decode: identity,
  name: 'view',
  createBufferTranscoder() {
    return new BufferFormat({
      encode: function (data) {
        return BufferWithFallback.isBuffer(data)
          ? data
          : ArrayBuffer.isView(data)
          ? BufferWithFallback.from(
              data.buffer,
              data.byteOffset,
              data.byteLength,
            )
          : BufferWithFallback.from(String(data), 'utf8');
      },
      decode: identity,
      name: `${this.name}+buffer`,
    });
  },
});

/**
 * @type {typeof import('./encodings').hex}
 */
export const hex = new BufferFormat({
  encode: function (data) {
    return BufferWithFallback.isBuffer(data)
      ? data
      : BufferWithFallback.from(String(data), 'hex');
  },
  decode: function (buffer) {
    return buffer.toString('hex');
  },
  name: 'hex',
});

/**
 * @type {typeof import('./encodings').base64}
 */
export const base64 = new BufferFormat({
  encode: function (data) {
    return BufferWithFallback.isBuffer(data)
      ? data
      : BufferWithFallback.from(String(data), 'base64');
  },
  decode: function (buffer) {
    return buffer.toString('base64');
  },
  name: 'base64',
});
