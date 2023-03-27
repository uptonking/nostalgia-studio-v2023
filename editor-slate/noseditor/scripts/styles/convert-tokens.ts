import fs from 'fs';
import { resolve } from 'path';
import util from 'util';

import { tokens } from '../../src/styles/theme-default';
import { generateTokensVarsFromTokensProps } from './utils/generate-theme-vars';
import { renameTokensOutputs } from './utils/rename-tokens-files';
import { __dirname } from './utils/utils';

const oldNewFiles = [
  ['../../../src/styles/tokens.css', '../../../src/styles/theme-default.css'],
  ['../../../src/styles/index.js', '../../../src/styles/theme-default.ts'],
];

oldNewFiles.forEach(([o, n]) => {
  renameTokensOutputs(resolve(__dirname, o), resolve(__dirname, n));
});

generateTokensVarsFromTokensProps(
  tokens,
  resolve(__dirname, '../../../src/styles/theme-vars.ts'),
);
