import {
  type CancelledReason,
  type Command,
  type CommandResult,
  type CoreCommand,
  type CoreCommandTypes,
} from '../types';

export const coreTypes = new Set<CoreCommandTypes>([
  'UPDATE_CELL',
  // "UPDATE_CELL_POSITION",
  // "CLEAR_CELL",
  // "DELETE_CONTENT",
]);

export function isCoreCommand(cmd: Command): cmd is CoreCommand {
  return coreTypes.has(cmd.type as any);
}

export const CommandResults = {
  Success: 'Success',
  CancelledForUnknownReason: 'CancelledForUnknownReason',
  InvalidTarget: 'InvalidTarget',
  EmptyUndoStack: 'EmptyUndoStack',
  EmptyRedoStack: 'EmptyRedoStack',
  ValuesNotChanged: 'ValuesNotChanged',
  Readonly: 'Readonly',
  InvalidRange: 'InvalidRange',
  InvalidSheetId: 'InvalidSheetId',
  MissingSheetName: 'MissingSheetName',
  DuplicatedSheetId: 'DuplicatedSheetId',
  NoActiveSheet: 'NoActiveSheet',
} as const;

/**
 * Holds the result of a command dispatch.
 * The command may have been successfully dispatched or cancelled
 * for one or more reasons.
 */
export class DispatchResult {
  readonly reasons: CancelledReason[];

  constructor(results: CommandResult | CommandResult[] = []) {
    if (!Array.isArray(results)) {
      results = [results];
    }
    results = [...new Set(results)];
    this.reasons = results.filter(
      (result): result is CancelledReason => result !== CommandResults.Success,
    );
  }

  /**
   * Static helper which returns a successful DispatchResult
   */
  static get Success() {
    return new DispatchResult();
  }

  get isSuccessful(): boolean {
    return this.reasons.length === 0;
  }

  isCancelledBecause(reason: CancelledReason): boolean {
    return this.reasons.includes(reason);
  }
}
