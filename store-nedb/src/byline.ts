import stream from 'node:stream';
import timers from 'node:timers';

interface LineStreamOptions extends stream.TransformOptions {
  keepEmptyLines?: boolean | undefined;
}

/** quickly wrap a readable stream
 * - `stream = byline(fs.createReadStream('sample.txt', { encoding: 'utf8' }));`
 */
export const createLineStream = (
  readStream?: NodeJS.ReadableStream,
  options?: LineStreamOptions,
) => {
  if (!readStream) throw new Error('expected readStream');
  if (!readStream.readable) throw new Error('readStream must be readable');
  const lineStream = new LineStream(options);
  readStream.pipe(lineStream);
  return lineStream;
};

/** Line-by-line Stream reader for node.js
 * - Fork from {@link https://github.com/jahewson/node-byline} /MIT.
 * @alias module:byline.LineStream
 * @private
 */
class LineStream extends stream.Transform {
  _readableState: any;
  _lineBuffer: any[];
  _keepEmptyLines: any;
  _lastChunkEndedWithCR: boolean;
  encoding: any;
  _chunkEncoding: any;

  constructor(options?: LineStreamOptions) {
    super(options);
    options = options || {};

    // use objectMode to stop the output from being buffered
    // which re-concatenates the lines, just without newlines.
    this._readableState.objectMode = true;
    this._lineBuffer = [];
    this._keepEmptyLines = options.keepEmptyLines || false;
    this._lastChunkEndedWithCR = false;

    // take the source's encoding if we don't have one
    this.once('pipe', (src) => {
      if (!this.encoding && src instanceof stream.Readable)
        // this.encoding = src._readableState.encoding; // but we can't do this for old-style streams
        this.encoding = src.readableEncoding;
    });
  }

  _transform(chunk, encoding, done) {
    // decode binary chunks as UTF-8
    encoding = encoding || 'utf8';

    if (Buffer.isBuffer(chunk)) {
      if (encoding === 'buffer') {
        chunk = chunk.toString(); // utf8
        encoding = 'utf8';
      } else chunk = chunk.toString(encoding);
    }
    this._chunkEncoding = encoding;

    // see: http://www.unicode.org/reports/tr18/#Line_Boundaries
    const lines = chunk.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/g);

    // don't split CRLF which spans chunks
    if (this._lastChunkEndedWithCR && chunk[0] === '\n') lines.shift();

    if (this._lineBuffer.length > 0) {
      this._lineBuffer[this._lineBuffer.length - 1] += lines[0];
      lines.shift();
    }

    this._lastChunkEndedWithCR = chunk[chunk.length - 1] === '\r';
    this._lineBuffer = this._lineBuffer.concat(lines);
    this._pushBuffer(encoding, 1, done);
  }

  _pushBuffer(encoding, keep, done) {
    // always buffer the last (possibly partial) line
    while (this._lineBuffer.length > keep) {
      const line = this._lineBuffer.shift();
      // skip empty lines
      if (this._keepEmptyLines || line.length > 0) {
        if (!this.push(this._reEncode(line, encoding))) {
          // when the high-water mark is reached, defer pushes until the next tick
          timers.setImmediate(() => {
            this._pushBuffer(encoding, keep, done);
          });
          return;
        }
      }
    }
    done();
  }

  _flush(done) {
    this._pushBuffer(this._chunkEncoding, 0, done);
  }

  // see Readable::push
  _reEncode(line, chunkEncoding) {
    if (this.encoding && this.encoding !== chunkEncoding)
      return Buffer.from(line, chunkEncoding).toString(this.encoding);
    else if (this.encoding)
      return line; // this should be the most common case, i.e. we're using an encoded source stream
    else return Buffer.from(line, chunkEncoding);
  }
}
