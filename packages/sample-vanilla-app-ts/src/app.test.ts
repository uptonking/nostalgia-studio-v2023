/**
 * @jest-environment jsdom
 */

import { changeTest } from './app';

describe('test-placeholder', () => {
  test('test-placeholder01', () => {
    expect(true).toBe(true);

    expect(changeTest()).toBeTruthy();
  });
});
