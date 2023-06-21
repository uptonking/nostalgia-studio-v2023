import { type StateObserver } from '../state/state-observer';
import {
  type CoreCommand,
  type CoreCommandDispatcher,
  type CoreGetters,
} from '../types';
import { type UuidGenerator } from '../utils/uuid';
import { BasePlugin } from './plugin-base';

export interface CorePluginConfig {
  readonly getters: CoreGetters;
  readonly stateObserver: StateObserver;
  // readonly range: RangeAdapter;
  // readonly range: any;
  readonly dispatch: CoreCommandDispatcher['dispatch'];
  readonly uuidGenerator: UuidGenerator;
  readonly custom: { [key: string]: any };
  readonly external: { [key: string]: any };
}

export interface CorePluginConstructor {
  new (config: CorePluginConfig): CorePlugin;
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
  }: CorePluginConfig) {
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
