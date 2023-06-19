import { type CommandResults, type DispatchResult } from '../utils/command';
import { type Dimension, type HeaderIndex, type UID } from './common';
import { type Format, type RangeData, type Style, type Zone } from './excel';

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

export interface AddColumnsRowsCommand extends GridDependentCommand {
  type: 'ADD_COLUMNS_ROWS';
  base: HeaderIndex;
  quantity: number;
  position: 'before' | 'after';
}

export type CoreCommand = UpdateCellCommand | AddColumnsRowsCommand;

export interface UndoCommand {
  type: 'UNDO';
  commands: readonly CoreCommand[];
}

export type LocalCommand = UndoCommand;

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
  dispatch<T extends CmdTypes, C extends Extract<Cmd, { type: T }>>(
    type: {} extends Omit<C, 'type'> ? T : never,
  ): DispatchResult;
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
  extends CommandDispatcher<CoreCommandTypes, CoreCommand> {}

export type CancelledReason = Exclude<
  CommandResult,
  (typeof CommandResults)['Success']
>;
