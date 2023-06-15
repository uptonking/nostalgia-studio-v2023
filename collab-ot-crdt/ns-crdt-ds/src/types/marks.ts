import {
  type DOMOutputSpec,
  type Mark,
  type MarkSpec,
  type Node,
  type Schema,
  type SchemaSpec,
} from 'prosemirror-model';

type Nodes = {
  readonly doc: {
    readonly content: 'block+';
  };
  readonly paragraph: {
    readonly content: 'text*';
    readonly group: 'block';
    readonly toDOM: () => any;
  };
  readonly text: {};
};

export type NodeType = keyof Nodes;
export type GroupType = {
  [T in NodeType]: Nodes[T] extends { group: string }
    ? Nodes[T]['group']
    : never;
}[NodeType];

type Quantifier = '+' | '*' | '?';

export type ContentDescription =
  | NodeType
  | GroupType
  | `${NodeType | GroupType}${Quantifier}`;

interface NodeSpec {
  content?: ContentDescription;
  group?: GroupType;
  toDOM?: (node: Node) => DOMOutputSpec;
}

export type Marks = {
  strong: {
    toDOM: () => ['strong'];
    allowMultiple: false;
    inclusive: true;
  };
  em: {
    toDOM: () => ['em'];
    allowMultiple: false;
    inclusive: true;
  };
  comment: any;
  link: any;
};

export type MarkType = keyof Marks;

export type DocSchema = Schema<
  'doc' | 'paragraph' | 'text',
  'strong' | 'em' | 'comment' | 'link'
>;
