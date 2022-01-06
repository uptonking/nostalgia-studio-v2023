const { hslToHex } = require('./colorUtils');

test('color/hslToHex', () => {
  expect(hslToHex(`hsl(0,0%,0%)`)).toBe('#000000');
});
