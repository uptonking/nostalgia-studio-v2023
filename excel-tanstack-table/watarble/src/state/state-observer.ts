import { type CoreCommand, type HistoryChange } from '../types';
import { createEmptyStructure } from '../utils/state';

/**
 * collect commands and changes for undo/redo/history
 */
export class StateObserver {
  private changes: HistoryChange[] = [];
  private commands: CoreCommand[] = [];

  /**
   * Record the changes which could happen in the given callback, save them in a
   * new revision with the given id and userId.
   */
  recordChanges(callback: () => void): {
    changes: HistoryChange[];
    commands: CoreCommand[];
  } {
    this.changes = [];
    this.commands = [];
    callback();
    return { changes: this.changes, commands: this.commands };
  }

  addCommand(command: CoreCommand) {
    this.commands.push(command);
  }

  addChange(...args: any[]) {
    const val: any = args.pop();
    const [root, ...path] = args as [any, string | number];
    let value = root as any;
    const key = path[path.length - 1];
    for (let pathIndex = 0; pathIndex <= path.length - 2; pathIndex++) {
      const p = path[pathIndex];
      if (value[p] === undefined) {
        const nextPath = path[pathIndex + 1];
        value[p] = createEmptyStructure(nextPath);
      }
      value = value[p];
    }
    if (value[key] === val) {
      return;
    }
    this.changes.push({
      root,
      path,
      before: value[key],
      after: val,
    });
    if (val === undefined) {
      delete value[key];
    } else {
      value[key] = val;
    }
  }
}

/**
 * Apply the changes of the given HistoryChange to the state
 */
export function applyChange(change: HistoryChange, target: 'before' | 'after') {
  let val = change.root as any;
  const key = change.path[change.path.length - 1];
  for (
    let pathIndex = 0;
    pathIndex < change.path.slice(0, -1).length;
    pathIndex++
  ) {
    const p = change.path[pathIndex];
    if (val[p] === undefined) {
      const nextPath = change.path[pathIndex + 1];
      val[p] = createEmptyStructure(nextPath);
    }
    val = val[p];
  }
  if (change[target] === undefined) {
    delete val[key];
  } else {
    val[key] = change[target];
  }
}
