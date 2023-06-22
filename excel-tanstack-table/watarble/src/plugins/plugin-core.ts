import { type StateObserver } from '../state/state-observer';
import { type ModelConfig } from '../state/watar-state';
import {
  type CoreCommand,
  type CoreCommandDispatcher,
  type CoreGetters,
} from '../types';
import { type DispatchResult } from '../utils/command';
import { type UuidGenerator } from '../utils/uuid';
import { BasePlugin } from './plugin-base';

export interface CorePluginOptions extends ModelConfig {
  readonly getters: CoreGetters;
  readonly stateObserver: StateObserver;
  readonly dispatch: CoreCommandDispatcher['dispatch'];
  readonly dispatchToCorePlugins: (command: CoreCommand) => DispatchResult;
  readonly emitStateUpdate: () => void;
  readonly uuidGenerator: UuidGenerator;
  // readonly range: RangeAdapter;
}

export interface CorePluginConstructor {
  new (config: CorePluginOptions): CorePlugin;
  getters?: readonly string[];
}

/**
 * core plugins handling persistent data
 */
export class CorePlugin<State = any, C = CoreCommand> extends BasePlugin<
  State,
  C
> {
  getters: CoreGetters;
  protected uuidGenerator: UuidGenerator;

  protected range: any;
  // protected range: RangeAdapter;

  constructor({
    getters,
    stateObserver,
    dispatch,
    uuidGenerator,
  }: CorePluginOptions) {
    super(stateObserver, dispatch);
    // this.range = range;
    // range.addRangeProvider(this.adaptRanges.bind(this));
    this.getters = getters;
    this.uuidGenerator = uuidGenerator;

    if (!new.target.pluginKey) {
      throw new Error(
        'pluginKey static property is required for ' + new.target.name,
      );
    }
  }

  import(data: any) {}
  export(data: any) {}

  // garbageCollectExternalResources() {}
}
