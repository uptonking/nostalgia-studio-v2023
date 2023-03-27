import pluginCSS from '@cobalt-ui/plugin-css';
import pluginJS from '@cobalt-ui/plugin-js';
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type import('@cobalt-ui/core').Config */
export default {
  outDir: './src/styles/',
  tokens: './src/styles/theme-default-tokens.json',
  plugins: [
    pluginCSS({
      prefix: 'nos-',
      modeSelectors: {
        // 'palette#light': ['[data-nos-theme="nos-t-light"]'],
        'palette#dark': ['[data-nos-theme="nos-t-dark"]'],
        'font.size#desktop': ['@media (min-width: 600px)'],
      },
    }),
    // pluginSass(),
    pluginJS(),
  ],
};
