/**
 * Extendable Custom Types Interface
 */

/** user Extendable Types */
type ExtendableTypes =
  | 'Editor'
  | 'Element'
  | 'Text'
  | 'Selection'
  | 'Range'
  | 'Point'
  | 'Operation'
  | 'InsertNodeOperation'
  | 'InsertTextOperation'
  | 'MergeNodeOperation'
  | 'MoveNodeOperation'
  | 'RemoveNodeOperation'
  | 'RemoveTextOperation'
  | 'SetNodeOperation'
  | 'SetSelectionOperation'
  | 'SplitNodeOperation';

export interface CustomTypes {
  [key: string]: unknown;
}

/** 若CustomTypes中存在可覆盖接口名，则使用CustomTypes中新定义的 */
export type ExtendedType<
  K extends ExtendableTypes,
  B,
> = unknown extends CustomTypes[K] ? B : CustomTypes[K];
