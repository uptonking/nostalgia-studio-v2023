import { NodeSpec, Schema, MarkSpec } from 'prosemirror-model';
import { doc, paragraph, text } from './nodes';
import { em, strong } from './marks';

export const createDefaultSchema = () =>
  createSchemaFromSpecs([baseSchema, blockQuoteSchema]);

export function createSchemaFromSpecs(specs: any[]) {
  const nodes = specs.reduce(
    (acc, cur) => ({ ...acc, ...cur.nodes }),
    {} as { [key: string]: NodeSpec },
  );
  const marks = specs.reduce(
    (acc, cur) => ({ ...acc, ...cur.marks }),
    {} as { [key: string]: MarkSpec },
  );
  return new Schema({
    nodes,
    marks,
  });
}

export const blockquote: NodeSpec = {
  content: 'paragraph+',
  group: 'block',
  defining: true,
  selectable: false,
  attrs: {
    class: { default: '' },
  },
  parseDOM: [{ tag: 'blockquote' }],
  toDOM() {
    return ['blockquote', 0];
  },
};

export const blockQuoteSchema: any = {
  nodes: { blockquote: blockquote },
};

export const baseSchema: any = {
  nodes: { doc, paragraph, text },
  marks: { em, strong },
};
