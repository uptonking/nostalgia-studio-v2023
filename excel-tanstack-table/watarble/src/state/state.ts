import {
  createTable,
  type Row,
  type RowData,
  type Table,
  type TableOptionsResolved,
} from '@tanstack/table-core';

import {
  type CorePlugin,
  type CorePluginConfig,
  type CorePluginConstructor,
} from '../plugins/plugin-core';
import {
  type UIPlugin,
  type UIPluginConfig,
  type UIPluginConstructor,
} from '../plugins/plugin-ui';
import { corePluginRegistry, uiPluginRegistry } from '../plugins/registry';
import {
  type Client,
  type Command,
  type CommandDispatcher,
  type CommandHandler,
  type CommandTypes,
  type CoreCommand,
  type CoreGetters,
  type Getters,
} from '../types';
import { DispatchResult, isCoreCommand } from '../utils/command';
import { EventEmitter } from '../utils/event-emitter';
import { UuidGenerator } from '../utils/uuid';
import { StateObserver } from './state-observer';

const Status = {
  Ready: 'Ready',
  Running: 'Running',
  RunningCore: 'RunningCore',
  Finalizing: 'Finalizing',
} as const;
type StatusType = (typeof Status)[keyof typeof Status];

export interface ModelConfig {
  readonly custom: { [key: string]: any };
  readonly external: { [key: string]: any };
  readonly client: Client;
  readonly snapshotRequested: boolean;
}

/**
 * state manager of watarable, including data-model,selection, ui-state, transient-data.
 * - It is just a state manager, splitting states into plugin states.
 * - state can only be updated by `dispatch`, then handled by plugins.
 * - state can be used in vanillajs environment.
 */
export class State<TData extends RowData = Array<object>>
  extends EventEmitter
  implements CommandDispatcher
{
  readonly config: ModelConfig;
  private corePluginConfig: CorePluginConfig;
  private uiPluginConfig: UIPluginConfig;

  private corePlugins: CorePlugin[] = [];
  private uiPlugins: UIPlugin[] = [];

  private state: StateObserver;

  readonly selection: any;

  /** used to read data from state */
  getters: Getters;
  private coreGetters: CoreGetters;
  uuidGenerator: UuidGenerator;

  private readonly handlers: CommandHandler<Command>[] = [];
  private readonly uiHandlers: CommandHandler<Command>[] = [];
  private readonly coreHandlers: CommandHandler<CoreCommand>[] = [];

  /**
   * Internal status of the model. Important for command handling coordination
   */
  private status: StatusType = Status.Ready;

  table: Table<TData>;
  content: Array<{ type: string; children: Row<TData>[] }>;
  store: Record<string, any>;

  /** custom data, can be accessed in plugin config */
  readonly custom: { [key: string]: any };

  /** custom data, useful for files/images */
  readonly external: { [key: string]: any };

  constructor(options: any) {
    super();

    const {
      data = {},
      config = {},
      uuidGenerator = new UuidGenerator(),
      id,
      environment,
      renderer,
      ...options_
    } = options;

    this.dispatch = this.dispatch.bind(this);

    // convert data
    const workingData = {} as any;

    this.state = new StateObserver();
    this.uuidGenerator = uuidGenerator;
    this.config = this.initConfig(config);

    this.coreGetters = {} as CoreGetters;
    this.getters = {
      // isReadonly: () => this.config.mode === "readonly" || this.config.mode === "dashboard",
    } as Getters;

    this.selection = {} as any;

    this.corePluginConfig = this.initCorePluginConfig();
    this.uiPluginConfig = this.initUiPluginConfig();

    for (const Plugin of corePluginRegistry.getAll()) {
      this.initCorePlugin(Plugin, workingData);
    }
    Object.assign(this.getters, this.coreGetters);

    for (const Plugin of uiPluginRegistry.getAll()) {
      const plugin = this.initUiPlugin(Plugin);
      this.uiPlugins.push(plugin);
      this.handlers.push(plugin);
      this.uiHandlers.push(plugin);
    }

    // this.dispatch('INIT');

    this.selection.observe(this, {
      // handleEvent: () => this.emit("update"),
    });

    const resolvedOptions: TableOptionsResolved<TData> = {
      state: {}, // Dummy state
      onStateChange: options.onStateChange || (() => {}), // noop
      renderFallbackValue: null,
      ...options_,
    };

    this.store = {};

    // console.log(';; resolvedOptions', resolvedOptions);
    this.table = createTable(resolvedOptions);
    this.table.setOptions((prev) => {
      return {
        ...prev,
        ...options_,
        state: {
          ...this.table.initialState,
          ...options_.state,
        },
        // onStateChange: (updater) => {
        //   // setState(updater);
        //   console.log(';; onStateChange ');
        //   options.onStateChange?.(updater);
        //   this.emit('MODEL_UPDATE');
        // },
      };
    });

    window['tbl'] = this.table;
    // console.log(
    //   ';; tb-init ',
    //   // this.table.initialState,
    //   this.table.getState(),
    //   this.table,
    // );

    this.content = [{ type: 'table', children: this.table.getRowModel().rows }];
  }

  dispatch(type: CommandTypes, payload?: any) {
    // this.emit('MODEL_UPDATE');
    const command: Command = createCommand(type, payload);
    const status: StatusType = this.status;
    // if (this.getters.isReadonly() && !canExecuteInReadonly(command)) {
    //   return new DispatchResult(CommandResult.Readonly);
    // }
    // if (!this.session.canApplyOptimisticUpdate()) {
    //   return new DispatchResult(CommandResult.WaitingSessionConfirmation);
    // }
    switch (status) {
      case Status.Ready: {
        const result = this.checkDispatchAllowed(command);
        if (!result.isSuccessful) {
          return result;
        }
        this.status = Status.Running;
        const { changes, commands } = this.state.recordChanges(() => {
          if (isCoreCommand(command)) {
            this.state.addCommand(command);
          }
          this.dispatchToHandlers(this.handlers, command);
          this.finalize();
        });
        // this.session.save(command, commands, changes);
        this.status = Status.Ready;
        this.emit('update');
        break;
      }
      case Status.Running:
        if (isCoreCommand(command)) {
          const dispatchResult = this.checkDispatchAllowed(command);
          if (!dispatchResult.isSuccessful) {
            return dispatchResult;
          }
          this.state.addCommand(command);
        }
        this.dispatchToHandlers(this.handlers, command);
        break;
      case Status.Finalizing:
        throw new Error('Cannot dispatch commands in the finalize state');
      case Status.RunningCore:
        if (isCoreCommand(command)) {
          throw new Error(
            `A UI plugin cannot dispatch ${type} while handling a core command`,
          );
        }
        this.dispatchToHandlers(this.handlers, command);
    }
    return DispatchResult.Success;
  }

  private dispatchToHandlers(
    handlers: CommandHandler<Command>[],
    command: Command,
  ) {
    for (const handler of handlers) {
      handler.beforeHandle(command);
    }
    for (const handler of handlers) {
      handler.handle(command);
    }
  }

  /**
   * Dispatch a command from a Core Plugin (or the History).
   * A command dispatched from this function is not added to the history.
   */
  private dispatchFromCorePlugin: CommandDispatcher['dispatch'] = (
    type: string,
    payload?: any,
  ) => {
    const command = createCommand(type, payload);
    const previousStatus = this.status;
    this.status = Status.RunningCore;
    // const handlers = this.isReplayingCommand ? this.coreHandlers : this.handlers;
    const handlers = this.handlers;
    this.dispatchToHandlers(handlers, command);
    this.status = previousStatus;
    return DispatchResult.Success;
  };

  /** compute derived state from model data */
  deriveModelChange() {
    this.content = [{ type: 'table', children: this.table.getRowModel().rows }];
  }

  private initConfig(config: Partial<ModelConfig>): ModelConfig {
    const client = config.client || {
      id: this.uuidGenerator.uuidv4(),
      name: 'Anonymous',
    };
    return {
      ...config,
      // mode: config.mode || "normal",
      custom: config.custom || {},
      external: config.external || {},
      client,
      snapshotRequested: false,
    };
  }

  private initCorePluginConfig(): CorePluginConfig {
    return {
      getters: this.coreGetters,
      stateObserver: this.state,
      // range: this.range,
      dispatch: this.dispatchFromCorePlugin,
      uuidGenerator: this.uuidGenerator,
      custom: this.config.custom,
      external: this.config.external,
    };
  }

  private initCorePlugin(Plugin: CorePluginConstructor, data: any) {
    const plugin = new Plugin(this.corePluginConfig);
    for (const name of Plugin.getters) {
      if (!(name in plugin)) {
        throw new Error(
          `Invalid getter name: ${name} for plugin ${plugin.constructor}`,
        );
      }
      if (name in this.coreGetters) {
        throw new Error(`Getter "${name}" is already defined.`);
      }
      this.coreGetters[name] = plugin[name].bind(plugin);
    }
    plugin.import(data);
    this.corePlugins.push(plugin);
    this.coreHandlers.push(plugin);
    this.handlers.push(plugin);
  }

  private initUiPluginConfig(): UIPluginConfig {
    return {
      getters: this.getters,
      stateObserver: this.state,
      dispatch: this.dispatch,
      selection: this.selection,
      custom: this.config.custom,
      // moveClient: this.session.move.bind(this.session),
      // uiActions: this.config,
      // lazyEvaluation: this.config.lazyEvaluation,
      // session: this.session,
    };
  }

  private initUiPlugin(Plugin: UIPluginConstructor) {
    const plugin = new Plugin(this.uiPluginConfig);
    for (const name of Plugin.getters) {
      if (!(name in plugin)) {
        throw new Error(
          `Invalid getter name: ${name} for plugin ${plugin.constructor}`,
        );
      }
      if (name in this.getters) {
        throw new Error(`Getter "${name}" is already defined.`);
      }
      this.getters[name] = plugin[name].bind(plugin);
    }
    // this.renderers.push(...layers);
    // this.renderers.sort((p1, p2) => p1[1] - p2[1]);
    return plugin;
  }

  private finalize() {
    this.status = Status.Finalizing;
    for (const h of this.handlers) {
      h.finalize();
    }
    this.status = Status.Ready;
  }

  /**
   * Check if the given command is allowed by all the plugins and the history.
   */
  private checkDispatchAllowed(command: Command): DispatchResult {
    // if (isCoreCommand(command)) {
    //   return this.checkDispatchAllowedCoreCommand(command);
    // }
    // return this.checkDispatchAllowedLocalCommand(command);
    return new DispatchResult();
  }

  canDispatch: CommandDispatcher['canDispatch'] = (
    type: string,
    payload?: any,
  ) => {
    return this.checkDispatchAllowed(createCommand(type, payload));
  };
}

function createCommand(type: string, payload: any = {}): Command {
  // const command = deepCopy(payload);
  const command = JSON.parse(JSON.stringify(payload));
  command.type = type;
  return command;
}
