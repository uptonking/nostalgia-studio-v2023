import { Buffer } from 'buffer';

import { Encoding } from './encoding';
import textEndec from './text-endec';

// const { Buffer } = require('buffer') || {}

/**
 * @template TIn, TOut
 * @extends {Encoding<TIn,Buffer,TOut>}
 */
export class BufferFormat extends Encoding {
  /**
   * @param {Omit<IEncoding<TIn, Buffer, TOut>, 'format'>} options
   */
  constructor(options) {
    super({ ...options, format: 'buffer' });
  }

  /** @override */
  createViewTranscoder() {
    return new ViewFormat({
      encode: this.encode, // Buffer is a view (UInt8Array)
      decode: (data) =>
        this.decode(Buffer.from(data.buffer, data.byteOffset, data.byteLength)),
      name: `${this.name}+view`,
    });
  }

  /** @override */
  createBufferTranscoder() {
    return this;
  }
}

/**
 * @extends {Encoding<TIn,Uint8Array,TOut>}
 * @template TIn, TOut
 */
export class ViewFormat extends Encoding {
  /**
   * @param {Omit<IEncoding<TIn, Uint8Array, TOut>, 'format'>} options
   */
  constructor(options) {
    super({ ...options, format: 'view' });
  }

  /** @override */
  createBufferTranscoder() {
    return new BufferFormat({
      encode: (data) => {
        const view = this.encode(data);
        return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
      },
      decode: this.decode, // Buffer is a view (UInt8Array)
      name: `${this.name}+buffer`,
    });
  }

  /** @override */
  createViewTranscoder() {
    return this;
  }
}

/**
 * @extends {Encoding<TIn,string,TOut>}
 * @template TIn, TOut
 */
export class UTF8Format extends Encoding {
  /**
   * @param {Omit<IEncoding<TIn, string, TOut>, 'format'>} options
   */
  constructor(options) {
    super({ ...options, format: 'utf8' });
  }

  /** @override */
  createBufferTranscoder() {
    return new BufferFormat({
      encode: (data) => Buffer.from(this.encode(data), 'utf8'),
      decode: (data) => this.decode(data.toString('utf8')),
      name: `${this.name}+buffer`,
    });
  }

  /** @override */
  createViewTranscoder() {
    const { textEncoder, textDecoder } = textEndec();

    return new ViewFormat({
      encode: (data) => textEncoder.encode(this.encode(data)),
      decode: (data) => this.decode(textDecoder.decode(data)),
      name: `${this.name}+view`,
    });
  }

  /** @override */
  createUTF8Transcoder() {
    return this;
  }
}

/**
 * @typedef {import('./encoding').IEncoding<TIn,TFormat,TOut>} IEncoding
 * @template TIn, TFormat, TOut
 */
