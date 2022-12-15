/**
 * Load and modify part of fs to ensure writeFile will crash after writing 5000 bytes
 */
import fs from 'fs';
import { Writable } from 'stream';
import { callbackify } from 'util';

// import { Datastore as Nedb } from "../../src/datastore";
// 👉🏻 测试时，不能在.js文件中import .ts；因为动态修改了fs，所以不能在顶部import，要放在底部

fs.promises.writeFile = async function (path, data) {
  let onePassDone = false;
  const options = { encoding: 'utf8', mode: 0o666, flag: 'w' }; // we don't care about the actual options passed

  const filehandle = await fs.promises.open(path, options.flag, options.mode);
  const buffer =
    data instanceof Buffer
      ? data
      : Buffer.from(String(data), options.encoding || 'utf8');
  // const buffer = (data instanceof Buffer) ? data : Buffer.from('' + data, 'utf8')
  let length = buffer.length;
  let offset = 0;

  try {
    while (length > 0) {
      if (onePassDone) {
        process.exit(1);
      } // Crash on purpose before rewrite done
      const { bytesWritten } = await filehandle.write(
        buffer,
        offset,
        Math.min(5000, length),
      ); // Force write by chunks of 5000 bytes to ensure data will be incomplete on crash
      onePassDone = true;
      offset += bytesWritten;
      length -= bytesWritten;
    }
  } finally {
    await filehandle.close();
  }
};

class FakeFsWriteStream extends Writable {
  filename;
  _content;

  constructor(filename) {
    super();
    this.filename = filename;
    this._content = Buffer.alloc(0);
  }

  _write(chunk, encoding, callback) {
    this._content = Buffer.concat([
      this._content,
      Buffer.from(chunk, encoding),
    ]);
    callback();
  }

  _end(chunk, encoding, callback) {
    this._content = Buffer.concat([
      this._content,
      Buffer.from(chunk, encoding),
    ]);
    callback();
  }

  close(callback) {
    callbackify(fs.promises.writeFile)(this.filename, this._content, callback);
  }
}

fs.createWriteStream = (path) => new FakeFsWriteStream(path);

// End of fs monkey patching
// const Nedb = require('../lib/datastore.js')
import Nedb from '@seald-io/nedb';
const db = new Nedb({ filename: 'tests/testdata/lac.db' });

db.loadDatabaseAsync(); // no need to await
