import { type UID } from './common';

export interface CreateRevisionOptions {
  revisionId?: UID;
  clientId?: UID;
  pending?: boolean;
}

export interface HistoryChange {
  root: any;
  path: (string | number)[];
  before: any;
  after: any;
}
