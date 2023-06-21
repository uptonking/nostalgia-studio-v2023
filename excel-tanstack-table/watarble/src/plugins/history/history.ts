import { type Session } from '../../editing';
import { type Command, type CommandResult, type UID } from '../../types';
import { CommandResults } from '../../utils/command';
import { MAX_HISTORY_STEPS } from '../../utils/constants';
import { UiPlugin, type UiPluginOptions } from '../plugin-ui';

/**
 * plugin for local undo/redo
 * - `EditSessionPlugin` must be initialized before this plugin
 */
export class HistoryPlugin extends UiPlugin {
  static pluginKey = 'WTBL_HISTORY';

  static getters = ['canUndo', 'canRedo'] as const;

  private undoStack: UID[] = [];

  private redoStack: UID[] = [];

  private session: Session;

  constructor(config: UiPluginOptions) {
    super(config);
    this.session = this.getters.getSession();
    this.session.on(
      '_SES_NEW_LOCAL_STATE_UPDATE',
      this.onNewLocalStateUpdate.bind(this),
    );
    // this.session.on("snapshot", this, () => {
    //   this.undoStack = [];
    //   this.redoStack = [];
    // });

    // window['undo'] = this.undoStack;
    // window['redo'] = this.redoStack;
  }

  allowDispatch(cmd: Command): CommandResult {
    switch (cmd.type) {
      case 'REQUEST_UNDO': {
        console.log(';; canUndo ', this.canUndo());
        if (!this.canUndo()) {
          return CommandResults.EmptyUndoStack;
        }
        break;
      }
      case 'REQUEST_REDO': {
        console.log(';; canRedo ', this.canRedo());
        if (!this.canRedo()) {
          return CommandResults.EmptyRedoStack;
        }
        break;
      }
    }
    return CommandResults.Success;
  }

  handle(cmd: Command) {
    switch (cmd.type) {
      case 'REQUEST_UNDO':
      case 'REQUEST_REDO':
        this.requestHistoryChange(
          cmd.type === 'REQUEST_UNDO' ? 'UNDO' : 'REDO',
        );
    }
  }

  private requestHistoryChange(type: 'UNDO' | 'REDO') {
    const id = type === 'UNDO' ? this.undoStack.pop() : this.redoStack.pop();
    if (!id) {
      // const lastNonRedoRevision = this.getLastPossibleRevision();
      // if (!lastNonRedoRevision) {
      return;
      // }
    }

    // console.log(';; undo/redo ', type);

    if (type === 'UNDO') {
      this.session.undo(id);
      this.redoStack.push(id);
    } else {
      this.session.redo(id);
      this.undoStack.push(id);
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    if (this.redoStack.length > 0) return true;
    // const lastNonRedoRevision = this.getLastPossibleRevision();
    // return canRepeatRevision(lastNonRedoRevision);
    return false;
  }

  private drop(revisionIds: UID[]) {
    this.undoStack = this.undoStack.filter((id) => !revisionIds.includes(id));
    this.redoStack = [];
  }

  /** push id to undoStack, and reset redoStack  */
  private onNewLocalStateUpdate({ id }: { id: UID }) {
    // console.log(';; onNewLocalStateUpdate ');
    this.undoStack.push(id);
    if (this.undoStack.length > MAX_HISTORY_STEPS) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  /**
   * Fetch the last revision which is not empty and not a repeated command
   *
   * Ignore repeated commands (REQUEST_REDO command as root command)
   * Ignore standard undo/redo revisions (that are empty)
   */
  //  private getLastPossibleRevision() {
  //   return this.session.getLastLocalNonEmptyRevision(["REQUEST_REDO"]);
  // }
}
