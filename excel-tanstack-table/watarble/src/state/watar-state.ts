import { type Row, type RowData, type Table } from '@tanstack/table-core';

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
  type CoreCommandTypes,
  type CoreGetters,
  type Getters,
  type WatarStateOptions,
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
  // readonly snapshotRequested: boolean;
}

/**
 * state manager of watarable, including data-model,selection, ui-state, transient-data.
 * - It is just a state container, splitting states into plugin states.
 * - state can only be updated by `dispatch`, then handled by plugins.
 * - state can be used in vanillajs environment.
 */
export class WatarState<TData extends RowData = Array<object>>
  extends EventEmitter
  implements CommandDispatcher
{
  readonly config: ModelConfig;
  private corePluginConfig: CorePluginConfig;
  private uiPluginConfig: UIPluginConfig;

  private corePlugins: CorePlugin[] = [];
  private uiPlugins: UIPlugin[] = [];

  private stateObserver: StateObserver;

  readonly selection: any;

  /** used to read data from state */
  getters: Getters;
  private coreGetters: CoreGetters;
  uuidGenerator: UuidGenerator;

  private readonly handlers: CommandHandler<Command>[] = [];
  private readonly uiHandlers: CommandHandler<Command>[] = [];
  private readonly coreHandlers: CommandHandler<CoreCommand>[] = [];

  /** actions/commands status, useful for commands scheduling */
  private status: StatusType = Status.Ready;

  table: Table<TData>;
  content: Array<{ type: string; children: Row<TData>[] }>;
  store: Record<string, any>;

  /** custom data, can be accessed in plugin config */
  readonly custom: { [key: string]: any };
  /** custom data, useful for files/images */
  readonly external: { [key: string]: any };

  constructor(options: WatarStateOptions) {
    super();

    this.dispatch = this.dispatch.bind(this);
    this.dispatchFromCorePlugin = this.dispatchFromCorePlugin.bind(this);
    this.canDispatch = this.canDispatch.bind(this);

    // convert data
    const workingData = options.table.data;

    this.stateObserver = new StateObserver();
    this.uuidGenerator = new UuidGenerator();
    this.config = this.initConfig(options);
    // console.log(';; wtbl-opts ', this.config)

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
      this.initUiPlugin(Plugin);
    }

    // this.dispatch('INIT');

    // this.selection.observe(this, {
    //   handleEvent: () => this.emit("update"),
    // });
  }

  dispatch<T extends CommandTypes, C extends Extract<Command, { type: T }>>(
    type: T,
    payload?: Omit<C, 'type'>,
  ): DispatchResult {
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
        const { changes, commands } = this.stateObserver.recordChanges(() => {
          if (isCoreCommand(command)) {
            this.stateObserver.addCommand(command);
          }
          this.dispatchToHandlers(this.handlers, command);
          this.finalize();
        });
        // this.session.save(command, commands, changes);
        this.status = Status.Ready;
        this.emit('STATE_UPDATE');
        break;
      }
      case Status.Running:
        if (isCoreCommand(command)) {
          const dispatchResult = this.checkDispatchAllowed(command);
          if (!dispatchResult.isSuccessful) {
            return dispatchResult;
          }
          this.stateObserver.addCommand(command);
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
   * Dispatch a command from a Core Plugin.
   * A command dispatched from this function is not added to the history.
   */
  private dispatchFromCorePlugin<
    T extends CoreCommandTypes,
    C extends Extract<CoreCommand, { type: T }>,
  >(type: T, payload?: Omit<C, 'type'>): DispatchResult {
    const command = createCommand(type, payload);
    const previousStatus = this.status;
    this.status = Status.RunningCore;
    // const handlers = this.isReplayingCommand ? this.coreHandlers : this.handlers;
    const handlers = this.handlers;
    this.dispatchToHandlers(handlers, command);
    this.status = previousStatus;
    return DispatchResult.Success;
  }

  private initConfig(options: Partial<ModelConfig>): ModelConfig {
    const client = options.client || {
      id: this.uuidGenerator.uuidv4(),
      name: 'Anonymous',
    };
    return {
      ...options,
      // mode: config.mode || "normal",
      custom: options.custom || {},
      external: options.external || {},
      client,
      // snapshotRequested: false,
    };
  }

  private initCorePluginConfig(): CorePluginConfig {
    return {
      getters: this.coreGetters,
      stateObserver: this.stateObserver,
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
      stateObserver: this.stateObserver,
      dispatch: this.dispatch,
      selection: this.selection,
      ...this.config,
      // custom: this.config.custom,
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
    this.uiPlugins.push(plugin);
    this.handlers.push(plugin);
    this.uiHandlers.push(plugin);
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

  canDispatch<T extends CommandTypes, C extends Extract<Command, { type: T }>>(
    type: T,
    payload: Omit<C, 'type'>,
  ): DispatchResult {
    return this.checkDispatchAllowed(createCommand(type, payload));
  }
}

function createCommand(type: string, payload: any = {}): Command {
  // const command = deepCopy(payload);
  const command = JSON.parse(JSON.stringify(payload));
  command.type = type;
  return command;
}
