import { Node as PMNode } from 'prosemirror-model';
import { Selection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { EventDispatcher } from './utils/event-dispatcher';

export type ContextUpdateHandler = (
  editorView: EditorView,
  eventDispatcher: EventDispatcher,
) => void;

export interface EditorActionsOptions<T> {
  focus(): boolean;
  blur(): boolean;
  clear(): boolean;
}

interface Transformer<T> {
  encode(node: PMNode): T;
  parse(content: T): Node;
}

/**
 * 管理EditorContext的value更新相关的事件处理函数。
 * 内置了一个eventDispatcher，但并未使用。
 * 提供了更新编辑器的方法，大多会调用 editorView.dispatch(tr)。
 */
export class EditorActions<T = any> implements EditorActionsOptions<T> {
  private editorView?: EditorView;
  private contentTransformer?: Transformer<T>;
  private contentEncode?: Transformer<T>['encode'];

  /** ? 作用是什么，全部被作为参数传递了，本class内并未直接使用 */
  private eventDispatcher?: EventDispatcher;

  /** EditorContext更新时，要执行的事件处理函数 */
  private listeners: Array<ContextUpdateHandler> = [];

  /** 创建自身EditorActions对象的静态方法 */
  static from<T>(
    view: EditorView,
    eventDispatcher: EventDispatcher,
    transformer?: Transformer<T>,
  ) {
    const editorActions = new EditorActions<T>();

    // 这里会执行所有注册过的cb函数
    editorActions._privateRegisterEditor(view, eventDispatcher, transformer);
    return editorActions;
  }

  // #region private
  // This method needs to be public for context based helper components.
  _privateGetEditorView(): EditorView | undefined {
    return this.editorView;
  }

  _privateGetEventDispatcher(): EventDispatcher | undefined {
    return this.eventDispatcher;
  }

  // This method needs to be public for EditorContext component.
  /** 执行所有注册过的cb函数 */
  _privateRegisterEditor(
    editorView: EditorView,
    eventDispatcher: EventDispatcher,
    contentTransformer?: Transformer<T>,
  ): void {
    this.contentTransformer = contentTransformer;
    this.eventDispatcher = eventDispatcher;

    if (!this.editorView && editorView) {
      this.editorView = editorView;

      // 执行所有注册过的cb函数
      this.listeners.forEach((cb) => cb(editorView, eventDispatcher));
    } else if (this.editorView !== editorView) {
      throw new Error(
        "Editor has already been registered! It's not allowed to re-register editor with the new Editor instance.",
      );
    }

    if (this.contentTransformer) {
      this.contentEncode = this.contentTransformer.encode.bind(
        this.contentTransformer,
      );
    }
  }

  // This method needs to be public for EditorContext component.
  /** 都设置为undefined */
  _privateUnregisterEditor(): void {
    this.editorView = undefined;
    this.contentTransformer = undefined;
    this.contentEncode = undefined;
    this.eventDispatcher = undefined;
  }

  /** 先执行一次回调函数，再注册 */
  _privateSubscribe(cb: ContextUpdateHandler): void {
    // If editor is registered and somebody is trying to add a listener,
    // just call it first.
    if (this.editorView && this.eventDispatcher) {
      cb(this.editorView, this.eventDispatcher);
    }

    this.listeners.push(cb);
  }

  _privateUnsubscribe(cb: ContextUpdateHandler): void {
    this.listeners = this.listeners.filter((c) => c !== cb);
  }
  // #endregion

  /** 先调用editorView.focus()，然后触发editorView.dispatch(this.editorView.state.tr.scrollIntoView())，
   * 会触发执行dispatchTransaction()
   */
  focus(): boolean {
    if (!this.editorView || this.editorView.hasFocus()) {
      return false;
    }

    this.editorView.focus();
    this.editorView.dispatch(this.editorView.state.tr.scrollIntoView());
    return true;
  }

  blur(): boolean {
    if (!this.editorView || !this.editorView.hasFocus()) {
      return false;
    }

    (this.editorView.dom as HTMLElement).blur();
    return true;
  }

  /** 删除selection */
  clear(): boolean {
    if (!this.editorView) {
      return false;
    }

    const editorView = this.editorView;
    const { state } = editorView;
    const tr = editorView.state.tr
      .setSelection(TextSelection.create(state.doc, 0, state.doc.nodeSize - 2))
      .deleteSelection();

    editorView.dispatch(tr);

    return true;
  }

  // async __temporaryFixForConfigPanel() {
  //   const { editorView } = this;
  //   if (!editorView) {
  //     return;
  //   }

  //   __temporaryFixForConfigPanel(editorView);
  // }

  /** editorView.dispatch在末尾添加文本的事务 tr.insertText */
  appendText(text: string): boolean {
    if (!this.editorView || !text) {
      return false;
    }

    const { state } = this.editorView;
    const lastChild = state.doc.lastChild;

    if (lastChild && lastChild.type !== state.schema.nodes.paragraph) {
      return false;
    }

    const tr = state.tr.insertText(text).scrollIntoView();
    this.editorView.dispatch(tr);

    return true;
  }
}
