export interface DataStoreOptions {
  filename?: string;
  timestampData?: boolean;
  inMemoryOnly?: boolean;
  autoload?: boolean;
  onload?(error?: Error | null): any;
  beforeDeserialization?(line: string): string;
  afterSerialization?(line: string): string;
  corruptAlertThreshold?: number;
  compareStrings?(a: string, b: string): number;
  modes?: { fileMode: number; dirMode: number };
  testSerializationHooks?: boolean;
}

export interface EnsureIndexOptions {
  fieldName?: string;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
}
