import ModuleError from 'module-error';

import { ManyLevelGuest } from './guest';
import { ManyLevelHost } from './host';

export { ManyLevelGuest, ManyLevelHost };

const warned = { client: false, server: false };

export const client = function (options) {
  if (
    !warned.client &&
    typeof console !== 'undefined' &&
    typeof console.warn === 'function'
  ) {
    warned.client = true;
    console.warn(
      new ModuleError(
        'The client export has been replaced with ManyLevelGuest and will be removed in a future version',
        { code: 'LEVEL_LEGACY' },
      ),
    );
  }

  return new ManyLevelGuest(options);
};

export const server = function (db, options) {
  if (!warned.server) {
    warned.server = true;
    console.warn(
      new ModuleError(
        'The server export has been replaced with ManyLevelHost and will be removed in a future version',
        { code: 'LEVEL_LEGACY' },
      ),
    );
  }

  return new ManyLevelHost(db, options).createRpcStream();
};
