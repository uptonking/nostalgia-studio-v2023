import { type StateObserver } from '../state/state-observer';
import {
  type CommandDispatcher,
  type CommandHandler,
  type CommandResult,
  type WorkbookHistory,
} from '../types';
import { CommandResults } from '../utils/command';

/**
 * base class for plugin.
 * - generally dont use this, use derived class.
 * - core-plugins handle persistent data and ui-plugins handle transient data
 */
export class BasePlugin<State = any, C = any> implements CommandHandler<C> {
  static getters: readonly string[] = [];

  protected history: WorkbookHistory<State>;
  protected dispatch: CommandDispatcher['dispatch'];

  constructor(
    stateObserver: StateObserver,
    dispatch: CommandDispatcher['dispatch'],
  ) {
    this.history = Object.assign(Object.create(stateObserver), {
      update: stateObserver.addChange.bind(stateObserver, this),
      // selectCell: () => {},
    });
    this.dispatch = dispatch;
  }

  /**
   * export is available for all plugins, even for the UI.
   */
  export(data: any) {}

  /**
   * Before exec command, the model will ask each plugin if command is allowed.
   * - If all of then return true, then we can proceed.
   * - Otherwise, the command is cancelled.
   * - There should not be any side effects in this method.
   */
  allowDispatch(command: C): CommandResult | CommandResult[] {
    return CommandResults.Success;
  }

  /**
   * useful when a plugin need to perform some action before a command is handled in another plugin.
   * - This should only be used if it is not possible to do the work in the handle method.
   */
  beforeHandle(command: C): void {}

  /**
   * handle any command.
   */
  handle(command: C): void {}

  /**
   * perform some work after a command (and all its subcommands) has been completely handled.
   */
  finalize(): void {}
}
