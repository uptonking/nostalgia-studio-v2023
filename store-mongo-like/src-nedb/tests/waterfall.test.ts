import chai from 'chai';

import { Waterfall } from '../src/waterfall';

const { expect } = chai;

describe('Waterfall - Promise Utils', () => {
  it('waterfall returns  () => promise', async () => {
    const w = new Waterfall();
    const p1 = Promise.resolve(11);
    const r1 = await p1;

    const p2 = w.waterfall(() => p1);
    const r2 = await p2();

    expect(r1).to.equal(r2);
  });

  it('waterfall chain returns last promise', async () => {
    const w = new Waterfall();
    // const p11 = Promise.resolve(11);
    // const p12 = Promise.resolve(22);

    const p11 = new Promise((resolve, reject) => {
      setTimeout(() => {
        // console.log(';; p11 ', 11)
        resolve(11);
      }, 0);
    });
    const p12 = new Promise((resolve, reject) => {
      setTimeout(() => {
        // console.log(';; p12 ', 22)
        resolve(22);
      }, 0);
    });

    const p21 = w.chain(p11);
    // console.log(';; p21-after ', p21);
    // expect(await p21).to.equal(11);
    const p22 = w.chain(p12);
    // const r2 = p22;
    // console.log(';; p22-after ', p22);

    // log order: p21-after > p22-after > p11 > p22

    expect(await p22).to.equal(22);
  });
});
