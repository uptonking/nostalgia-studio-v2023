import fs from 'fs';
import { resolve } from 'path';
import util from 'util';

import { tokens } from '../../src/outputs';
import { generateTokensCssVarsFromTokensProps } from './utils/generate-css-vars';
import { renameTokensOutputs } from './utils/rename-tokens-files';
import { __dirname } from './utils/utils';

const oldNewFilenames = [
  [
    '../../../src/outputs/tokens.css',
    '../../../src/outputs/pgd-t-tailwind.css',
  ],
  // ['../../../src/outputs/index.js', '../../../src/outputs/pgd-t-tailwind.ts'],
];

function renameGeneratedFilesAndConvertToCssVars() {
  oldNewFilenames.forEach(([o, n]) => {
    renameTokensOutputs(resolve(__dirname, o), resolve(__dirname, n));
  });

  generateTokensCssVarsFromTokensProps(
    tokens,
    resolve(__dirname, '../../../src/outputs/pgd-t-tailwind-vars.ts'),
    'pgd',
  );
}

renameGeneratedFilesAndConvertToCssVars();
