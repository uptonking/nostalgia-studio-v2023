export interface ADFEntityMark {
  type: string;
  attrs?: { [name: string]: any };
}

/** atlassian document format 规定的属性名和数据类型 */
export interface ADFEntity {
  type: string;
  attrs?: { [name: string]: any };
  content?: Array<ADFEntity | undefined>;
  marks?: Array<ADFEntityMark>;
  text?: string;
  [key: string]: any;
}

export type Visitor = (
  node: ADFEntity,
  parent: EntityParent,
  index: number,
  depth: number,
) => ADFEntity | false | undefined | void;

export type VisitorCollection = { [nodeType: string]: Visitor };

export type EntityParent = { node?: ADFEntity; parent?: EntityParent };
