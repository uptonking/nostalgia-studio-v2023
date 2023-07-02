import { type FSWatcher, promises, watch } from 'fs';

import { type Callback, type Json } from '../common-d';
import { UTF8 } from '../common/strings';
import {
  type createFilePersister as createFilePersisterDecl,
  type Persister,
} from '../persisters-d';
import { type Store } from '../store-d';
import { createCustomPersister } from './common';

export const createFilePersister: typeof createFilePersisterDecl = (
  store: Store,
  filePath: string,
): Persister => {
  let watcher: FSWatcher | undefined;

  const getPersisted = async (): Promise<string | null | undefined> => {
    try {
      return await promises.readFile(filePath, UTF8);
    } catch {}
  };

  const setPersisted = async (json: Json): Promise<void> => {
    try {
      await promises.writeFile(filePath, json, UTF8);
    } catch {}
  };

  const startListeningToPersisted = (didChange: Callback): void => {
    watcher = watch(filePath, didChange);
  };

  const stopListeningToPersisted = (): void => {
    watcher?.close();
    watcher = undefined;
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
  );
};
