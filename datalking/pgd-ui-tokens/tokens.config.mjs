import pluginCSS from '@cobalt-ui/plugin-css';
import pluginJS from '@cobalt-ui/plugin-js';
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type import('@cobalt-ui/core').Config */
export default {
  outDir: './src/outputs/',
  tokens: './src/tokens/theme-tailwind.tokens.json',
  plugins: [
    pluginCSS({
      prefix: 'pgd-',
      modeSelectors: {
        // 'palette#light': ['[data-pgd-theme="pgd-t-light"]'],
        'palette#dark': ['[data-pgd-theme="pgd-t-dark"]'],
        'font.size#desktop': ['@media (min-width: 768px)'],
      },
      p3: false,
      // p3: process.env.NODE_ENV === 'production',
    }),
    // pluginSass(),
    pluginJS(),
  ],
};
