/**
 * @description create editor
 * @author wangfupeng
 */

import { createEditor, type Descendant } from 'slate';
import { withHistory } from 'slate-history';

import { genEditorConfig } from '../config/index';
import { type IEditorConfig } from '../config/interface';
import { DomEditor } from '../editor/dom-editor';
import { type IDomEditor } from '../editor/interface';
import { withConfig } from '../editor/plugins/with-config';
import { withContent } from '../editor/plugins/with-content';
import { withDOM } from '../editor/plugins/with-dom';
import { withEmitter } from '../editor/plugins/with-emitter';
import { withEventData } from '../editor/plugins/with-event-data';
import { withMaxLength } from '../editor/plugins/with-max-length';
import { withSelection } from '../editor/plugins/with-selection';
import HoverBar from '../menus/bar/HoverBar';
import TextArea from '../text-area/TextArea';
import { type DOMElement } from '../utils/dom';
import $ from '../utils/dom';
import { promiseResolveThen } from '../utils/util';
import {
  EDITOR_TO_CONFIG,
  EDITOR_TO_HOVER_BAR,
  EDITOR_TO_TEXTAREA,
  HOVER_BAR_TO_EDITOR,
  TEXTAREA_TO_EDITOR,
} from '../utils/weak-maps';
import bindNodeRelation from './bind-node-relation';
import {
  genDefaultContent,
  htmlToContent,
  isRepeatedCreateTextarea,
} from './helper';

type PluginFnType = <T extends IDomEditor>(editor: T) => T;

interface ICreateOption {
  selector: string | DOMElement;
  config: Partial<IEditorConfig>;
  content?: Descendant[];
  html?: string;
  plugins: PluginFnType[];
}

/**
 * 创建编辑器
 */
export default function (option: Partial<ICreateOption>) {
  const { selector = '', config = {}, content, html, plugins = [] } = option;

  /**
   * 💡 create editor using Slate
   */
  let editor = withHistory(
    withMaxLength(
      withEmitter(
        withSelection(
          withContent(withConfig(withDOM(withEventData(createEditor())))),
        ),
      ),
    ),
  );
  if (selector) {
    // 检查是否对同一个 DOM 重复创建
    if (isRepeatedCreateTextarea(editor, selector)) {
      throw new Error(`Repeated create editor by selector '${selector}'`);
    }
  }

  // 处理配置
  const editorConfig = genEditorConfig(config);
  EDITOR_TO_CONFIG.set(editor, editorConfig);
  const { hoverbarKeys = {} } = editorConfig;

  // 💡 注册第三方插件
  plugins.forEach((plugin) => {
    editor = plugin(editor);
  });

  // 初始化内容（要在 config 和 plugins 后面）
  if (html != null) {
    // 传入 html ，转换为 JSON content
    editor.children = htmlToContent(editor, html);
  }
  if (content && content.length) {
    editor.children = content; // 传入 JSON content
  }
  if (editor.children.length === 0) {
    editor.children = genDefaultContent(); // 默认内容
  }
  DomEditor.normalizeContent(editor); // 格式化，用户输入的 content 可能不规范（如两个相连的 text 没有合并）

  if (selector) {
    // 传入了 selector ，则创建 textarea DOM
    const textarea = new TextArea(selector);
    // 💡 将代表数据的editor对象和代表视图的textarea对象都暴露到全局
    EDITOR_TO_TEXTAREA.set(editor, textarea);
    TEXTAREA_TO_EDITOR.set(textarea, editor);
    // 触发textarea更新
    textarea.changeViewState(); // 初始化时触发一次，以便能初始化 textarea DOM 和 selection

    // 判断 textarea 最小高度，并给出提示
    promiseResolveThen(() => {
      const $scroll = textarea.$scroll;
      if ($scroll == null) return;
      if ($scroll.height() < 300) {
        let info = '编辑区域高度 < 300px 这可能会导致 modal hoverbar 定位异常';
        info +=
          '\nTextarea height < 300px . This may be cause modal and hoverbar position error';
        console.warn(info, $scroll);
      }
    });

    // 创建 hoverbar DOM
    let hoverbar: HoverBar | null;
    if (Object.keys(hoverbarKeys).length > 0) {
      hoverbar = new HoverBar();
      HOVER_BAR_TO_EDITOR.set(hoverbar, editor);
      EDITOR_TO_HOVER_BAR.set(editor, hoverbar);
    }

    // 隐藏 panel and modal
    editor.on('change', () => {
      editor.hidePanelOrModal();
    });
    editor.on('scroll', () => {
      editor.hidePanelOrModal();
    });
  } else {
    // 未传入 selector ，则遍历 content ，绑定一些 WeakMap 关系 （ NODE_TO_PARENT, NODE_TO_INDEX 等 ）
    editor.children.forEach((node, i) =>
      bindNodeRelation(node, i, editor, editor),
    );
  }

  // 触发生命周期
  const { onCreated, onDestroyed } = editorConfig;
  if (onCreated) {
    editor.on('created', () => onCreated(editor));
  }
  if (onDestroyed) {
    editor.on('destroyed', () => onDestroyed(editor));
  }

  // 创建完毕，异步触发 created
  promiseResolveThen(() => editor.emit('created'));

  return editor;
}
