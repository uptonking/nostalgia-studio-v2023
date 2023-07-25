import {
  type ClientId,
  type Command,
  type CoreCommand,
  type HistoryChange,
  type RevisionData,
  type UID,
} from '../types';

/** T is mostly Revision */
export class Operation<T = unknown> {
  constructor(
    readonly id: UID,
    readonly data: T,
  ) {}
}

/**
 * a revision contains a series of commands and corresponding changes.
 */
export class Revision implements RevisionData {
  readonly id: UID;
  readonly clientId: ClientId;
  readonly rootCommand?: Command | 'SNAPSHOT' | 'REMOTE' | undefined;
  readonly timestamp?: number;
  private _commands: readonly CoreCommand[] = [];
  private _changes: readonly HistoryChange[] = [];

  constructor(
    id: UID,
    clientId: ClientId,
    commands: readonly CoreCommand[],
    rootCommand?: Command | 'SNAPSHOT' | 'REMOTE' | undefined,
    changes?: readonly HistoryChange[],
    timestamp?: number,
  ) {
    this.id = id;
    this.clientId = clientId;
    this._commands = [...commands];
    this._changes = changes ? [...changes] : [];
    this.rootCommand = rootCommand;
    this.timestamp = timestamp;
  }

  setChanges(changes: readonly HistoryChange[]) {
    this._changes = changes;
  }

  get commands(): readonly CoreCommand[] {
    return this._commands;
  }

  get changes(): readonly HistoryChange[] {
    return this._changes;
  }
}
