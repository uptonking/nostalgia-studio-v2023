export type JSONNode = {
  type: string;
  content?: Array<JSONNode | undefined>;
  attrs?: object;
  marks?: any[];
  text?: string;
};

export type JSONDocNode = {
  type: 'doc';
  content: JSONNode[];
  version: number;
};
