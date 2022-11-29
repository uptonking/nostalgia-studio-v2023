import fs from 'fs';
import path from 'path';

import chai from 'chai';

import { createLineStream as byline } from '../src/byline';
import { __dirname } from './utils/fs';

const { assert } = chai;

const regEx = /\r\n|[\n\v\f\r\x85\u2028\u2029]/g;
const localPath = (file) =>
  path.join(__dirname, '..', 'testdata', 'byline', file);

const EMPTY_FILE_IT = 'empty.txt';
const TEST_FILE_IT = 'test.txt';
const CRLF_FILE_IT = 'CRLF.txt';
const RFC_FILE_IT = 'rfc.txt';
const RFC_HUGE_FILE_IT = 'rfc_huge.txt';

describe('byline', function () {
  it('should pipe a small file', function (done) {
    const input = fs.createReadStream(localPath(EMPTY_FILE_IT));
    const lineStream = byline(input); // convenience API
    const output = fs.createWriteStream(localPath(TEST_FILE_IT));
    lineStream.pipe(output);
    output.on('close', function () {
      const out = fs.readFileSync(localPath(TEST_FILE_IT), 'utf8');
      const in_ = fs
        .readFileSync(localPath(EMPTY_FILE_IT), 'utf8')
        .replace(/\r?\n/g, '');
      assert.equal(in_, out);
      fs.unlinkSync(localPath(TEST_FILE_IT));
      done();
    });
  });

  it('should work with streams2 API', function (done) {
    let stream = fs.createReadStream(localPath(EMPTY_FILE_IT));
    stream = byline(stream) as any;

    stream.on('readable', function () {
      while (stream.read() !== null) {
        // eslint-ignore-line no-empty
      }
    });

    stream.on('end', function () {
      done();
    });
  });

  it('should ignore empty lines by default', function (done) {
    const input = fs.createReadStream(localPath(EMPTY_FILE_IT));
    const lineStream = byline(input);
    lineStream.setEncoding('utf8');

    const lines1 = [];
    lineStream.on('data', function (line) {
      lines1.push(line);
    });

    lineStream.on('end', function () {
      let lines2 = fs
        .readFileSync(localPath(EMPTY_FILE_IT), 'utf8')
        .split(regEx);
      lines2 = lines2.filter(function (line) {
        return line.length > 0;
      });
      assert.deepEqual(lines2, lines1);
      done();
    });
  });

  it('should keep empty lines when keepEmptyLines is true', function (done) {
    const input = fs.createReadStream(localPath(EMPTY_FILE_IT));
    const lineStream = byline(input, { keepEmptyLines: true });
    lineStream.setEncoding('utf8');

    const lines = [];
    lineStream.on('data', function (line) {
      lines.push(line);
    });

    lineStream.on('end', function () {
      assert.deepEqual(['', '', '', '', '', 'Line 6'], lines);
      done();
    });
  });

  it('should not split a CRLF which spans two chunks', function (done) {
    const input = fs.createReadStream(localPath(CRLF_FILE_IT));
    const lineStream = byline(input, { keepEmptyLines: true });
    lineStream.setEncoding('utf8');

    const lines = [];
    lineStream.on('data', function (line) {
      lines.push(line);
    });

    lineStream.on('end', function () {
      assert.equal(2, lines.length);
      done();
    });
  });

  it('should read a large file', function (done) {
    readFile(localPath(RFC_FILE_IT), done);
  });

  it('should read a huge file', function (done) {
    // Readable highWaterMark is 16384, so we test a file with more lines than this
    readFile(localPath(RFC_HUGE_FILE_IT), done);
  });

  function readFile(filename, done) {
    const input = fs.createReadStream(filename);
    const lineStream = byline(input);
    lineStream.setEncoding('utf8');

    let lines2 = fs.readFileSync(filename, 'utf8').split(regEx);
    lines2 = lines2.filter(function (line) {
      return line.length > 0;
    });

    const lines1 = [];
    let i = 0;
    lineStream.on('data', function (line) {
      lines1.push(line);
      if (line !== lines2[i]) {
        console.log('EXPECTED:', lines2[i]);
        console.log('     GOT:', line);
        assert.fail(null, null, 'difference at line ' + (i + 1));
      }
      i++;
    });

    lineStream.on('end', function () {
      assert.equal(lines2.length, lines1.length);
      assert.deepEqual(lines2, lines1);
      done();
    });
  }

  it('should handle encodings like fs', function (done) {
    areStreamsEqualTypes(undefined, function () {
      areStreamsEqualTypes({ encoding: 'utf8' }, function () {
        done();
      });
    });
  });

  it('should pause() and resume() with a huge file', function (done) {
    const input = fs.createReadStream(localPath(RFC_HUGE_FILE_IT));
    const lineStream = byline(input);
    lineStream.setEncoding('utf8');

    let lines2 = fs
      .readFileSync(localPath(RFC_HUGE_FILE_IT), 'utf8')
      .split(regEx);
    lines2 = lines2.filter(function (line) {
      return line.length > 0;
    });

    const lines1 = [];
    let i = 0;
    lineStream.on('data', function (line) {
      lines1.push(line);
      if (line !== lines2[i]) {
        console.log('EXPECTED:', lines2[i]);
        console.log('     GOT:', line);
        assert.fail(null, null, 'difference at line ' + (i + 1));
      }
      i++;

      // pause/resume
      lineStream.pause();
      setImmediate(function () {
        lineStream.resume();
      });
    });

    lineStream.on('end', function () {
      assert.equal(lines2.length, lines1.length);
      assert.deepEqual(lines2, lines1);
      done();
    });
  });

  function areStreamsEqualTypes(options, callback) {
    const fsStream = fs.createReadStream(localPath(EMPTY_FILE_IT), options);
    const lineStream = byline(
      fs.createReadStream(localPath(EMPTY_FILE_IT), options),
    );
    fsStream.on('data', function (data1) {
      lineStream.on('data', function (data2) {
        assert.equal(Buffer.isBuffer(data1), Buffer.isBuffer(data2));
      });
      lineStream.on('end', function () {
        callback();
      });
    });
  }
});
