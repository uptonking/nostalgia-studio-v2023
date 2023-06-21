import { type CoreCommand } from './command';
import { type ClientId, type UID } from './common';

export interface RevisionData {
  readonly id: UID;
  readonly clientId: ClientId;
  readonly commands: readonly CoreCommand[];
}

export interface CreateRevisionOptions {
  revisionId?: UID;
  clientId?: UID;
  pending?: boolean;
}

export interface HistoryChange {
  /** root is generally plugin instance object */
  root: any;
  /** path of change in plugin instance object */
  path: (string | number)[];
  before: any;
  after: any;
}

export interface WorkbookHistory<Plugin> {
  update<T extends keyof Plugin>(key: T, val: Plugin[T]): void;
  update(...keysAndPlugin: any[]): void;
}
