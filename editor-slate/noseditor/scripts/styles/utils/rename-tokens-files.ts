import fs from 'fs-extra';

import { __dirname } from './utils';

export function renameTokensOutputs(src: string, dest: string) {
  try {
    fs.moveSync(src, dest, { overwrite: true });
  } catch (err) {
    console.error(err);
  }
}
