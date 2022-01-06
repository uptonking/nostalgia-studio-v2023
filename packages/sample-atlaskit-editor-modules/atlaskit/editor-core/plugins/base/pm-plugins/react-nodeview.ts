import { Plugin, PluginKey } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export type StateChangeHandler = (fromPos: number, toPos: number) => any;

/** 精简的事件管理器，可以注册事件函数，实现逻辑和react无关 */
export class ReactNodeViewState {
  private changeHandlers: StateChangeHandler[] = [];

  constructor() {
    this.changeHandlers = [];
  }

  subscribe(cb: StateChangeHandler) {
    this.changeHandlers.push(cb);
  }

  unsubscribe(cb: StateChangeHandler) {
    this.changeHandlers = this.changeHandlers.filter((ch) => ch !== cb);
  }

  /** 执行所有注册过的事件处理函数 */
  notifyNewSelection(fromPos: number, toPos: number) {
    this.changeHandlers.forEach((cb) => cb(fromPos, toPos));
  }
}

export const stateKey = new PluginKey<ReactNodeViewState>('reactNodeView');

/** pm-Plugin.state中保存的是事件管理器，每次EditorState更新都会执行所有注册过的事件函数。
 * 实现逻辑和react无关。
 */
export const plugin = new Plugin({
  state: {
    init() {
      return new ReactNodeViewState();
    },
    apply(_tr, pluginState: ReactNodeViewState) {
      return pluginState;
    },
  },
  key: stateKey,
  view: (view: EditorView) => {
    const pluginState: ReactNodeViewState = stateKey.getState(view.state);

    return {
      update: (view: EditorView) => {
        const { from, to } = view.state.selection;
        pluginState.notifyNewSelection(from, to);
      },
    };
  },
});

const plugins = () => [plugin];

export default plugins;
