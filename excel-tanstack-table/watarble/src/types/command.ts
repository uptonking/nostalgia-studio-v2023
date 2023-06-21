import { type SortingState, type TableState } from '@tanstack/table-core';

import { type CommandResults, type DispatchResult } from '../utils/command';
import {
  type Dimension,
  type Format,
  type HeaderIndex,
  type RangeData,
  type SortDirection,
  type SortOptions,
  type Style,
  type UID,
  type Zone,
} from './common';

export interface SheetDependentCommand {
  sheetId: UID;
}

export interface GridDependentCommand {
  sheetId: UID;
  dimension: Dimension;
}

export interface PositionDependentCommand {
  sheetId: UID;
  col: number;
  row: number;
}

export interface TargetDependentCommand {
  sheetId: UID;
  target: Zone[];
}

export interface RangesDependentCommand {
  ranges: RangeData[];
}

export interface UpdateCellCommand extends PositionDependentCommand {
  type: 'UPDATE_CELL';
  content?: string;
  style?: Style | null;
  format?: Format;
}

/**
 * Move a cell to a given position or clear the position.
 */
export interface UpdateCellPositionCommand extends PositionDependentCommand {
  type: 'UPDATE_CELL_POSITION';
  cellId?: UID;
}

export interface ClearCellCommand extends PositionDependentCommand {
  type: 'CLEAR_CELL';
}

export interface DeleteCellCommand {
  type: 'DELETE_CELL';
  shiftDimension: Dimension;
  zone: Zone;
}

export interface InsertCellCommand {
  type: 'INSERT_CELL';
  shiftDimension: Dimension;
  zone: Zone;
}

export interface AddColumnsRowsCommand extends GridDependentCommand {
  type: 'ADD_COLUMNS_ROWS';
  base: HeaderIndex;
  quantity: number;
  position: 'before' | 'after';
}

export interface RemoveColumnsRowsCommand extends GridDependentCommand {
  type: 'REMOVE_COLUMNS_ROWS';
  elements: HeaderIndex[];
}

export interface HideColumnsRowsCommand extends GridDependentCommand {
  type: 'HIDE_COLUMNS_ROWS';
  elements: HeaderIndex[];
}

export interface UnhideColumnsRowsCommand extends GridDependentCommand {
  type: 'UNHIDE_COLUMNS_ROWS';
  elements: HeaderIndex[];
}

export interface CreateSheetCommand extends SheetDependentCommand {
  type: 'CREATE_SHEET';
  position: number;
  name?: string; // required in master
  cols?: number;
  rows?: number;
}

export interface DeleteSheetCommand extends SheetDependentCommand {
  type: 'DELETE_SHEET';
}

export interface DuplicateSheetCommand extends SheetDependentCommand {
  type: 'DUPLICATE_SHEET';
  sheetIdTo: UID;
}

export interface HideSheetCommand extends SheetDependentCommand {
  type: 'HIDE_SHEET';
}

export interface ShowSheetCommand extends SheetDependentCommand {
  type: 'SHOW_SHEET';
}

export interface SetOutlineBorderColorCommand extends SheetDependentCommand {
  type: 'SET_OUTLINE_BORDER_COLOR';
  color?: string;
}

export interface StartCommand {
  type: 'START';
}

export interface StateInitializedCommand {
  type: 'STATE_INITIALIZED';
}

export interface StartEditionCommand {
  type: 'START_EDITION';
  text?: string;
  // selection?: ComposerSelection;
  selection?: any;
}

export interface StopEditionCommand {
  type: 'STOP_EDITION';
  cancel?: boolean;
}

export interface UndoCommand {
  type: 'UNDO';
  commands: readonly CoreCommand[];
}

export interface RedoCommand {
  type: 'REDO';
  commands: readonly CoreCommand[];
}

export interface RequestUndoCommand {
  type: 'REQUEST_UNDO';
}

export interface RequestRedoCommand {
  type: 'REQUEST_REDO';
}

export interface SaveEditHistoryCommand {
  type: 'SAVE_EDIT_HISTORY';
  edits: any;
}

export interface SortCommand {
  type: 'SORT_CELLS';
  sheetId: UID;
  col: number;
  row: number;
  zone: Zone;
  sortDirection: SortDirection;
  sortOptions?: SortOptions;
}

export interface ToggleColumnSortingCommand {
  type: 'TOGGLE_COLUMN_SORTING';
  column: UID;
}

export interface UpdateColumnSortingCommand {
  type: 'UPDATE_COLUMN_SORTING';
  sorting: SortingState;
}

export interface UpdateTableStateCommand {
  type: 'UPDATE_TABLE_STATE';
  tableState: Partial<TableState>;
}

export interface ShowToolbarCommand {
  type: 'SET_TOOLBAR_VISIBILITY';
  show: boolean;
}

/**
 * core commands are shared in collaboration
 * - core commands should be self-contain to process core state, agnostic to local state
 */
export type CoreCommand =
  | UpdateCellCommand
  | UpdateCellPositionCommand
  | ClearCellCommand
  | AddColumnsRowsCommand
  | RemoveColumnsRowsCommand
  | HideColumnsRowsCommand
  | CreateSheetCommand
  | DeleteSheetCommand
  // | DuplicateSheetCommand
  | SetOutlineBorderColorCommand
  | HideSheetCommand;

/**
 * local commands process local state, can be converted to core commands, not shared in collab
 * - local commands can use local state like activeView to process state
 */
export type LocalCommand =
  | UndoCommand
  | RedoCommand
  | RequestUndoCommand
  | RequestRedoCommand
  | SaveEditHistoryCommand
  | StartCommand
  | StateInitializedCommand
  | StartEditionCommand
  | StopEditionCommand
  | SortCommand
  | ToggleColumnSortingCommand
  | UpdateColumnSortingCommand
  | UpdateTableStateCommand
  | DeleteCellCommand
  | InsertCellCommand
  | ShowToolbarCommand;

export type Command = CoreCommand | LocalCommand;

export type CommandTypes = Command['type'];
export type CoreCommandTypes = CoreCommand['type'];

export type CommandResult =
  (typeof CommandResults)[keyof typeof CommandResults];

export interface CommandHandler<T> {
  allowDispatch(command: T): CommandResult | CommandResult[];
  beforeHandle(command: T): void;
  handle(command: T): void;
  finalize(): void;
}

export interface CommandDispatcher<CmdTypes = CommandTypes, Cmd = Command> {
  // dispatch<T extends CmdTypes, C extends Extract<Cmd, { type: T }>>(
  //   type: {} extends Omit<C, 'type'> ? T : never,
  // ): DispatchResult;
  dispatch<T extends CmdTypes, C extends Extract<Cmd, { type: T }>>(
    type: T,
    r: Omit<C, 'type'>,
  ): DispatchResult;
  canDispatch<T extends CmdTypes, C extends Extract<Cmd, { type: T }>>(
    type: T,
    r: Omit<C, 'type'>,
  ): DispatchResult;
}

export interface CoreCommandDispatcher
  extends CommandDispatcher<CoreCommandTypes, CoreCommand> { }

export type CancelledReason = Exclude<
  CommandResult,
  (typeof CommandResults)['Success']
>;
