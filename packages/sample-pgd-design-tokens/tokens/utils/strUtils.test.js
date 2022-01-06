const { replaceRefWithCssVars } = require('./strUtils');

test('str/replaceRefWithCssVars', () => {
  expect(replaceRefWithCssVars(`hsl(0,0%,0%)`, 'aa')).toBe('hsl(0,0%,0%)');
  expect(replaceRefWithCssVars(`{a.b}`, 'var(')).toBe('var(');
  expect(replaceRefWithCssVars(`c{a.b}d`, 'var(')).toBe('cvar(d');
});
