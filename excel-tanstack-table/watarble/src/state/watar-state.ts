import { type Row, type RowData, type Table } from '@tanstack/table-core';

import {
  type CorePlugin,
  type CorePluginConstructor,
  type CorePluginOptions,
} from '../plugins/plugin-core';
import {
  type UiPlugin,
  type UiPluginConstructor,
  type UiPluginOptions,
} from '../plugins/plugin-ui';
import {
  getCorePluginRegistry,
  getUiPluginRegistry,
} from '../plugins/registry';
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
  type HistoryChange,
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
  readonly id: string;
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
  implements CommandDispatcher {
  readonly config: ModelConfig;
  private corePluginConfig: CorePluginOptions;
  private uiPluginConfig: UiPluginOptions;

  private corePlugins: CorePlugin[] = [];
  private uiPlugins: UiPlugin[] = [];

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

  /** custom data, can be accessed in plugin config */
  readonly custom: { [key: string]: any };
  /** custom data, useful for files/images */
  readonly external: { [key: string]: any };

  constructor(options: WatarStateOptions) {
    super();

    this.canDispatch = this.canDispatch.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.dispatchFromCorePlugin = this.dispatchFromCorePlugin.bind(this);
    this.dispatchToCorePlugins = this.dispatchToCorePlugins.bind(this);
    this.emitStateUpdate = this.emitStateUpdate.bind(this);

    // todo load and convert initial data
    const workingData = options.table.data;

    this.stateObserver = new StateObserver();
    this.uuidGenerator = new UuidGenerator();
    this.config = this.initConfig(options);

    this.coreGetters = {} as CoreGetters;
    this.getters = {} as Getters;

    this.corePluginConfig = this.initCorePluginConfig();
    this.uiPluginConfig = this.initUiPluginConfig();

    // this.selection = {} as any;

    for (const Plugin of getCorePluginRegistry(options.id!).getAll()) {
      this.initCorePlugin(Plugin, workingData);
    }
    Object.assign(this.getters, this.coreGetters);

    for (const Plugin of getUiPluginRegistry(options.id!).getAll()) {
      this.initUiPlugin(Plugin);
    }

    // this.dispatch('STATE_INITIALIZED');
    this.emit('STATE_INITIALIZED');

    // this.selection.observe(this, {
    //   handleEvent: () => this.emit("STATE_UPDATE"),
    // });
  }

  /**
   * central method for update plugin states
   */
  dispatch<T extends CommandTypes, C extends Extract<Command, { type: T }>>(
    type: T,
    payload?: Omit<C, 'type'>,
  ): DispatchResult {
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
            // ? why only for core cmd
            this.stateObserver.addCommand(command);
          }
          this.dispatchToHandlers(this.handlers, command);
          this.finalize();
        });
        this.tryToSaveEditsHistory({ command, commands, changes });
        this.status = Status.Ready;
        this.emitStateUpdate();
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

  private tryToSaveEditsHistory(edits: {
    command: Command;
    commands: CoreCommand[];
    changes: HistoryChange[];
  }) {
    const editSession = this.getters.getSession();
    if (editSession) {
      const { command, commands, changes } = edits;
      editSession.save(command, commands, changes);
    }
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

  /** dispatch command to all plugins
   * - wont record changes by default
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

  private dispatchToCorePlugins(command: CoreCommand) {
    const result = this.checkDispatchAllowed(command);
    if (!result.isSuccessful) {
      return undefined;
    }
    // this.isReplayingCommand = true;
    this.dispatchToHandlers(this.coreHandlers, command);
    // this.isReplayingCommand = false;
    return DispatchResult.Success;
  }

  private initConfig(options: Partial<ModelConfig>): ModelConfig {
    const client = options.client || {
      id: this.uuidGenerator.uuidv4(),
      name: 'AnonymousClient',
    };
    return {
      ...options,
      id: options.id,
      // mode: config.mode || "normal",
      custom: options.custom || {},
      external: options.external || {},
      client,
      // snapshotRequested: false,
    };
  }

  /**
   * corePlugin.dispatch doesnot record changes by default
   */
  private initCorePluginConfig(): CorePluginOptions {
    return {
      ...this.config,
      getters: this.coreGetters,
      stateObserver: this.stateObserver,
      dispatch: this.dispatchFromCorePlugin,
      dispatchToCorePlugins: this.dispatchToCorePlugins,
      emitStateUpdate: this.emitStateUpdate,
      uuidGenerator: this.uuidGenerator,
      // range: this.range,
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

  private initUiPluginConfig(): UiPluginOptions {
    return {
      ...this.config,
      getters: this.getters,
      stateObserver: this.stateObserver,
      dispatch: this.dispatch,
      emitStateUpdate: this.emitStateUpdate,
      selection: this.selection,
      // custom: this.config.custom,
      // moveClient: this.session.move.bind(this.session),
      // uiActions: this.config,
      // lazyEvaluation: this.config.lazyEvaluation,
      // session: this.session,
    };
  }

  private initUiPlugin(Plugin: UiPluginConstructor) {
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

  /** emit STATE_UPDATE event, mostly for view update */
  emitStateUpdate() {
    this.emit('STATE_UPDATE');
  }
}

function createCommand(type: string, payload: any = {}): Command {
  // const command = deepCopy(payload);
  const command = JSON.parse(JSON.stringify(payload));
  command.type = type;
  return command;
}
