import type { EditorView } from 'prosemirror-view';
import remark from 'remark';

import type { Atom } from '../abstract';
import { LoadState } from '../constant';
import type { CompleteContext } from '../context';
import {
  InputRulesLoader,
  KeymapLoader,
  NodeViewsLoader,
  ParserLoader,
  SchemaLoader,
  SerializerLoader,
  ViewLoader,
  ViewLoaderOptions,
} from '../loader';
import type { AnyRecord } from '../utility';

/** milkdown编辑器所有操作的顶级入口类，但pm-EditorView的创建不在这里 */
export class Editor {
  #atoms: Atom[] = [];
  /** 全局单例的数据及状态对象 */
  #ctx: AnyRecord = {
    loadState: LoadState.Idle,
    remark: remark(),
    nodes: [],
    marks: [],
    editor: this,
    prosemirrorPlugins: [],
  };

  /** 通过Object.assign更新this.#ctx的值 */
  #updateCtx = (value: AnyRecord) => {
    Object.assign(this.#ctx, value);
  };

  /** 对所有atoms通过简单赋值注入实例属性  */
  #injectCtx() {
    this.#atoms.forEach((atom) =>
      atom.injectContext(this.#ctx as CompleteContext, this.#updateCtx),
    );
  }

  /** 执行状态为loadState的所有atoms中的main()方法 */
  #runAtomByLoadState(loadState: LoadState) {
    this.#atoms
      .filter((atom) => atom.loadAfter === loadState)
      .forEach((atom) => {
        atom.main();
      });
  }

  /** 将一个atom保存到this.#atoms数组，重复时旧atom会被覆盖 */
  #addAtom(atom: Atom) {
    const i = this.#atoms.findIndex((a) => a.id === atom.id);
    if (i >= 0) {
      console.warn(
        `Atom: ${atom.id} is conflicted with previous atom, the previous one will be override.`,
      );
      this.#atoms.splice(i, 1);
    }
    this.#atoms.push(atom);
  }

  constructor(options: Partial<ViewLoaderOptions>) {
    const viewOptions: ViewLoaderOptions = {
      root: document.body,
      defaultValue: '',
      listener: {},
      ...options,
    };

    this.use([
      new SchemaLoader(),
      new ParserLoader(),
      new SerializerLoader(),
      new KeymapLoader(),
      new InputRulesLoader(),
      new NodeViewsLoader(),

      // 创建pm-EditorState和pm-EditorView对象
      new ViewLoader(viewOptions),
    ]);
  }

  /** 将参数中所有atom/atoms都保存到this.#atoms数组 */
  use(atom: Atom | Atom[]) {
    if (Array.isArray(atom)) {
      atom.forEach((a) => {
        this.#addAtom(a);
      });
      return this;
    }
    this.#addAtom(atom);
    return this;
  }

  /** 依次执行状态分别为idle/loadSchema/schemaReady/loadPlugin/complele的所有atoms的main方法 */
  create() {
    this.#injectCtx();
    [
      LoadState.Idle,
      LoadState.LoadSchema,
      LoadState.SchemaReady,
      LoadState.LoadPlugin,
      LoadState.Complete,
    ].forEach((state) => {
      this.#ctx.loadState = state;
      this.#runAtomByLoadState(state);
    });
  }

  /** 返回pm-EditorView对象 */
  get view(): EditorView {
    const ctx = this.#ctx as CompleteContext;
    return ctx.editorView;
  }
}
