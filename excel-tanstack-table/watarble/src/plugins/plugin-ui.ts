import { type StateObserver } from '../state/state-observer';
import {
  type ClientPosition,
  type Command,
  type CommandDispatcher,
  type Getters,
} from '../types';
import { BasePlugin } from './plugin-base';

export interface UIPluginConfig {
  readonly getters: Getters;
  readonly stateObserver: StateObserver;
  readonly dispatch: CommandDispatcher['dispatch'];
  // readonly selection: SelectionStreamProcessor;
  readonly selection: any;
  readonly custom: { [key: string]: any };
  // readonly moveClient: (position: ClientPosition) => void;
  // readonly uiActions: UIActions;
  // readonly session: Session;
}

export interface UIPluginConstructor {
  new (config: UIPluginConfig): UIPlugin;
  // layers: LAYERS[];
  getters: readonly string[];
}

/**
 * plugins handling transient data, useful for ui state
 */
export class UIPlugin<State = any, C = Command> extends BasePlugin<State, C> {
  // static layers: LAYERS[] = [];

  protected getters: Getters;
  // protected ui: UIActions;
  protected selection: any;
  constructor({ getters, stateObserver, dispatch, selection }: UIPluginConfig) {
    super(stateObserver, dispatch);
    this.getters = getters;
    this.selection = selection;
    // this.ui = uiActions;
  }

  view(ctx: RenderingContext) {}
}
