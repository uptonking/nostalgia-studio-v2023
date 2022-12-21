export type DatastoreDefaultsOptions = {
  autoIndexing: boolean;
  autoLoad: boolean;
  store: { db: any };
};

export interface DataStoreOptionsProps {
  /** schema for model */
  schema?: Record<string, any>
  /** @deprecated initial data. use `modelObj.insert(docs)` instead */
  raw?: any;
  /** postpone query execution until after wait milliseconds have elapsed */
  liveQueryDebounce?: number;
  /** default true. if true, the database will automatically be loaded from the datafile upon creation
   * - Any command issued before load is finished is buffered and will be executed when load is done. Is not read after instantiation. */
  autoload?: boolean;
  /** path to the file where the data is persisted.
   * - If left blank, the datastore is automatically considered in-memory only.
   * - It cannot end with a `~` which is used in the temporary files NeDB uses to perform crash-safe writes. Is not read after instantiation.*/
  filename?: string;
  /** default false. if true, timestamp the insertion and last update of all documents, with the fields `createdAt` and `updatedAt`.
   * - User-specified values override automatic generation, usually useful for testing */
  timestampData?: boolean;
  /** use to transform data after it was serialized and before it is written to disk.
  /** compares strings a and b, and return -1, 0 or 1.
   * - If specified, it overrides default string comparison which is not well adapted to non-US characters in particular accented letters.
   * - Native `localCompare` will most of the time be the right choice */
  compareStrings?: (a: string, b: string) => number;
}

export interface PersistenceOptionsProps {
  /** use to transform data after it was serialized and before it is written to disk.
   * - Can be used for example to encrypt data before writing database to disk.
   **/
  afterSerialization?: (line: string) => string;
  /** use to transform data after load to memory and before deserialized.
   * - Make sure to include both and not just one or you risk data loss.
   **/
  beforeDeserialization?: (line: string) => string;
  /** Whether to test the serialization hooks or not, might be CPU-intensive.
   * - `beforeSer(afterDeSer(str)) ?== str` */
  testSerializationHooks?: boolean;
  /** between 0 and 1, defaults to 10%.
   * - 0 means you don't tolerate any corruption, 1 means you don't care.
   * - NeDB will refuse to start if more than this percentage of the datafile is corrupt.
   */
  corruptAlertThreshold?: number;
  /** Permissions to use for FS. Only used for Node.js storage module. Wont work on Windows.
   * - [.fileMode] number = 0o644 - Permissions to use for database files
   * - [.dirMode] number = 0o755  - Permissions to use for database directories
   */
  modes?: { fileMode?: number; dirMode?: number };
}

export interface EnsureIndexOptions {
  fieldName?: string;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
}
