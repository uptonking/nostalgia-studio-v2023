import { Schema } from 'prosemirror-model';

export const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      selectable: false,
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    },
    pmBlockquote: {
      content: 'paragraph+',
      group: 'block',
      defining: true,
      selectable: false,
      attrs: {
        // > 预定义是蓝色，PMNode中会有这个属性，下面类型的PMNode没有
        class: { default: 'pm-blockquote' },
      },
      parseDOM: [{ tag: 'blockquote' }],
      toDOM(node) {
        return ['blockquote', node.attrs, 0];
      },
    },
    blockquote: {
      content: 'paragraph+',
      group: 'block',
      defining: true,
      selectable: false,
      parseDOM: [{ tag: 'blockquote' }],
      // 没有使用toDOM，使用的是自定义NodeView，颜色完全自定义
      toDOM() {
        return ['blockquote', 0];
      },
    },
    text: {
      group: 'inline',
    },
  },
});
