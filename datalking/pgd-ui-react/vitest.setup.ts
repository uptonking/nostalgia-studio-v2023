import { createElement, Suspense, version } from 'react';

import failOnConsole from 'vitest-fail-on-console';

import { render } from '@ariakit/test';
import _matchers, {
  type TestingLibraryMatchers,
} from '@testing-library/jest-dom/matchers.js';

const matchers = _matchers as unknown as typeof _matchers.default;

// declare module 'vitest' {
//   interface JestAssertion<T = any>
//     extends jest.Matchers<void, T>,
//       TestingLibraryMatchers<T, void> {}
// }

failOnConsole();

expect.extend(matchers);

expect.extend({
  toHaveFocus(element: HTMLElement, expected, options) {
    const toHaveFocus = matchers.toHaveFocus.bind(this) as any;
    const result = toHaveFocus(element, expected, options);
    const { activeElement } = element.ownerDocument;
    const activeId =
      activeElement && activeElement.getAttribute('aria-activedescendant');
    return {
      ...result,
      pass: result.pass || activeId === element.id,
      message: () => {
        if (activeId) {
          return [
            this.utils.matcherHint(
              `${this.isNot ? '.not' : ''}.toHaveFocus`,
              'element',
              '',
            ),
            '',
            'Expected:',
            `  ${this.utils.printExpected(element)}`,
            'Received:',
            `  ${this.utils.printReceived(
              element.ownerDocument.getElementById(activeId),
            )}`,
          ].join('\n');
        }
        return result.message();
      },
    };
  },
});

// @ts-expect-error fix-types
beforeEach(async ({ meta }) => {
  const filename = meta.file?.name;
  // console.log(';; beforeTest ', filename)
  if (!filename) return;
  const match = filename.match(/tests\/(.*)\/test.ts$/);
  // console.log(';; beforeTest2 ', match, match[1])
  if (!match) return;
  const [, example] = match;
  const { default: comp } = await import(`./tests/${example}/index.tsx`);
  const { unmount } = render(
    createElement(Suspense, { fallback: null, children: createElement(comp) }),
  );
  return unmount;
});
