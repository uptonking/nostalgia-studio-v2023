import pluginCSS from '@cobalt-ui/plugin-css';
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  outDir: './src/styles/',
  tokens: './src/styles/theme-default.tokens.json',
  plugins: [
    pluginCSS({
      prefix: 'nos-',
      modeSelectors: {
        // 'palette#light': ['[data-nos-theme="nos-t-light"]'],
        'palette#dark': ['[data-nos-theme="nos-t-dark"]'],
        'font.size#desktop': ['@media (min-width: 600px)'],
      },
      p3: process.env.NODE_ENV === 'production',
    }),
    // pluginSass(),
    pluginJS(),
  ],
};
