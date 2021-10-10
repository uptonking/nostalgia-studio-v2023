import { MarkdownSerializerState } from 'prosemirror-markdown';
import { Node as PMNode } from 'prosemirror-model';

import Extension from '../lib/Extension';

/** 支持自定义schema对象包括toDOM和parseDOM属性的节点，还可以配置plugins相关信息。
 * 此Node是完全自定义class，不是PMNode和ReactNode的子类 */
export default abstract class Node extends Extension {
  abstract get schema();

  get type() {
    return 'node';
  }

  get markdownToken(): string {
    return '';
  }

  toMarkdown(state: MarkdownSerializerState, node: PMNode) {
    console.error('toMarkdown not implemented', state, node);
  }

  parseMarkdown() {
    return;
  }
}
