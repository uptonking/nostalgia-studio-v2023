import { stringHash } from '../src/common';
import { encodeHlc } from '../src/hlc';

describe('hybrid logic clock test', () => {
  test('encode-hlc', () => {
    const hashStr = stringHash('913863d3-3cf7-4fb0-a586-da012bec310a');
    const hlc1 = encodeHlc(Date.now(), 10, hashStr);
    // console.log(
    //   ';; ',
    //   hashStr,
    //   hlc1.slice(0, 7),
    //   hlc1.slice(7, 11),
    //   hlc1.slice(11),
    // );

    expect(hlc1.length).toBe(16);
  });
});
