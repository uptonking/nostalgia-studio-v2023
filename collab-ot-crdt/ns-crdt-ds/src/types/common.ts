import { type CHILDREN, type HEAD, type ROOT } from '../utils/constants';
import { type Marks, type MarkType } from './marks';
import { type Assert, type Values } from './utils';

export type MarkOperation = AddMarkOperation | RemoveMarkOperation;

/** A position at which a mark operation can start or end.
 *  In a text string with n characters, there are 2n+2 boundary positions:
 *  one to the left or right of each character, plus the start and end of the string.
 */
export type BoundaryPosition =
  | { type: 'before'; elemId: OperationId }
  | { type: 'after'; elemId: OperationId }
  | { type: 'startOfText' }
  | { type: 'endOfText' };

export type MarkOpsPosition = 'markOpsBefore' | 'markOpsAfter';

export interface AddMarkOperationBase<M extends MarkType>
  extends BaseOperation {
  action: 'addMark';
  /** List element to apply the mark start. */
  start: BoundaryPosition;
  /** List element to apply the mark end, inclusive. */
  end: BoundaryPosition;
  /** Mark to add. */
  markType: M;
}

export interface FormatSpanWithText {
  text: string;
  marks: MarkMap;
}

export type AddMarkOperation = Values<{
  [M in MarkType]: keyof Omit<MarkValue[M], 'active'> extends never
    ? AddMarkOperationBase<M> & { attrs?: undefined }
    : AddMarkOperationBase<M> & {
        attrs: Required<Omit<MarkValue[M], 'active'>>;
      };
}>;

interface RemoveMarkOperationBase<M extends MarkType> extends BaseOperation {
  action: 'removeMark';
  /** List element to apply the mark start. */
  start: BoundaryPosition;
  /** List element to apply the mark end, inclusive. */
  end: BoundaryPosition;
  /** Mark to add. */
  markType: M;
}

export type RemoveMarkOperation =
  | RemoveMarkOperationBase<'strong'>
  | RemoveMarkOperationBase<'em'>
  | (RemoveMarkOperationBase<'comment'> & {
      /** Data attributes for the mark. */
      attrs: MarkValue['comment'];
    })
  | RemoveMarkOperationBase<'link'>;

interface AddMarkOperationInputBase<M extends MarkType> {
  action: 'addMark';
  /** Path to a list object. */
  path: OperationPath;
  /** Index in the list to apply the mark start, inclusive. */
  startIndex: number;
  /** Index in the list to end the mark, exclusive. */
  endIndex: number;
  /** Mark to add. */
  markType: M;
}

// TODO: automatically populate attrs type w/o manual enumeration
export type AddMarkOperationInput = Values<{
  [M in MarkType]: keyof Omit<MarkValue[M], 'active'> extends never
    ? AddMarkOperationInputBase<M> & { attrs?: undefined }
    : AddMarkOperationInputBase<M> & {
        attrs: Required<Omit<MarkValue[M], 'active'>>;
      };
}>;

// TODO: What happens if the mark isn't active at all of the given indices?
// TODO: What happens if the indices are out of bounds?
interface RemoveMarkOperationInputBase<M extends MarkType> {
  action: 'removeMark';
  /** Path to a list object. */
  path: OperationPath;
  /** Index in the list to remove the mark, inclusive. */
  startIndex: number;
  /** Index in the list to end the mark removal, exclusive. */
  endIndex: number;
  /** Mark to remove. */
  markType: M;
}

export type RemoveMarkOperationInput =
  | (RemoveMarkOperationInputBase<'strong'> & {
      attrs?: undefined;
    })
  | (RemoveMarkOperationInputBase<'em'> & {
      attrs?: undefined;
    })
  | (RemoveMarkOperationInputBase<'comment'> & {
      /** Data attributes for the mark. */
      attrs: MarkValue['comment'];
    })
  | (RemoveMarkOperationInputBase<'link'> & {
      /** Data attributes for the mark. */
      attrs?: undefined;
    });

type CommentMarkValue = {
  id: string;
};

type BooleanMarkValue = { active: boolean };
type LinkMarkValue = { url: string };

export type MarkValue = Assert<
  {
    strong: BooleanMarkValue;
    em: BooleanMarkValue;
    comment: CommentMarkValue;
    link: LinkMarkValue;
  },
  { [K in MarkType]: Record<string, unknown> }
>;

export type MarkMap = {
  [K in MarkType]?: Marks[K]['allowMultiple'] extends true
    ? Array<MarkValue[K]>
    : MarkValue[K];
};

export type FormatSpan = {
  marks: MarkMap;
  start: number;
};

/**
 * As we walk through the document applying the operation, we keep track of whether we've reached the right area.
 */
type MarkOpState = 'BEFORE' | 'DURING' | 'AFTER';

/** A patch which only has a start index and not an end index yet.
 *  Used when we're iterating thru metadata sequence and constructing a patch to emit.
 */
type PartialPatch =
  | Omit<AddMarkOperationInput, 'endIndex'>
  | Omit<RemoveMarkOperationInput, 'endIndex'>;

/** A patch represents a change to make to a JSON document.
 *  These are a way for Micromerge to notify a listener of incremental changes
 *  to update a document.
 */
export type Patch =
  | MakeListOperationInput
  | (InsertOperationInput & { marks: any })
  // | (InsertOperationInput & { marks: MarkMapWithoutOpIds })
  | DeleteOperationInput
  | AddMarkOperationInput
  | RemoveMarkOperationInput;

export type CONTENT_KEY = 'text';

export type ActorId = string;
export type OperationId = string;
export type Cursor = { objectId: ObjectId; elemId: ElemId };

/** The operation that created the object. */
export type ObjectId = OperationId | typeof ROOT;
export type ElemId = OperationId | typeof HEAD;
export type ChangeNumber = number;
export type OpNumber = number;

export type Char = string; /** 1-string */
export type JsonPrimitive = string | number | boolean | null;
export type JsonComposite = { [key: string]: Json } | Array<Json>;
export type Json = JsonPrimitive | JsonComposite;

export type OperationPath = [] | [CONTENT_KEY];

/**
 * A vector clock data structure.
 * Maps an actor ID to the latest sequence number from that actor.
 */
export type Clock = Record<ActorId, number>;

/**
 * A batch of operations from a single actor, applied transactionally.
 */
export interface Change {
  /** ID of the actor generated the change. */
  actor: ActorId;
  /** Actor's current change version. */
  seq: ChangeNumber;
  /** Latest change the author has seen from each actor, prior to the change. */
  deps: Clock;
  /** Number of the first operation in the change.
   * - Subsequent operations are assigned IDs in an incrementing sequence. */
  startOp: OpNumber;
  /** Operations contained in the change, ordered temporally. */
  ops: Operation[];
}

export interface InsertOperationInput {
  action: 'insert';
  /** Path to the array to modify. */
  path: OperationPath;
  /** Insert characters at the given index. */
  index: number;
  /** List of individual characters to be inserted in the given order. */
  values: Char[];
}

export interface DeleteOperationInput {
  action: 'delete';
  /** Path to the array to modify. */
  path: OperationPath;
  /** Insert characters at the given index. */
  index: number;
  /** Number of characters to delete. */
  count: number;
}

/** Create a new array field with the given key, at the chosen path. */
// TODO: What about inserting arrays into arrays?
// TODO: Is it illegal to insert at key "foo" in an array?
// TODO: Can `key` be a number when inserting into an array?
export interface MakeListOperationInput {
  action: 'makeList';
  /** Path to an object in which to insert a new field. */
  path: OperationPath;
  /** Key at which to create the array field.
        Key should not exist at the given path. */
  key: string;
}

/** Create a new map field with the given key, at the chosen path. */
export interface MakeMapOperationInput {
  action: 'makeMap';
  /** Path to an object in which to insert a new field. */
  path: OperationPath;
  /** Key at which to create the map field. Should not exist at the given path. */
  key: string;
}

export interface SetOperationInput {
  action: 'set';
  /** Path to an object containing the field to set. */
  path: OperationPath;
  /** Field to set at the given path. */
  key: string;
  /** Value to set at the given field. */
  value: JsonPrimitive;
}

export interface DelOperationInput {
  action: 'del';
  /** Path to an object containing the field to delete. */
  path: OperationPath;
  /** Field to delete at the given path. */
  key: string;
}

export type InputOperation =
  | MakeListOperationInput
  | MakeMapOperationInput
  | SetOperationInput
  | DelOperationInput
  | InsertOperationInput
  | DeleteOperationInput
  | AddMarkOperationInput
  | RemoveMarkOperationInput;

export interface BaseOperation {
  /** ID of the object at the given path. */
  obj: ObjectId;
  /** ID of the operation. In a different namespace than changes. */
  opId: OperationId;
}

export interface InsertOperation extends BaseOperation {
  action: 'set';
  /** the ID of the reference element; we want to insert after this element */
  elemId: ElemId;
  /** Individual item to insert. */
  value: Json;
  /** Indicates the operation should be handled as an insertion. */
  insert: true;
  /** To allow type refinements. */
  key?: undefined;
}

export interface DeleteOperation extends BaseOperation {
  action: 'del';
  /** Element ID at which to delete item. */
  elemId: ElemId;
  /** To allow type refinements. */
  key?: undefined;
}

/** Create a new array field with the given key, in the chosen object. */
export interface MakeListOperation extends BaseOperation {
  action: 'makeList';
  /** Key at which to create the array field.
        Only present if `obj` points to a map.  */
  key: string;
}

/** Create a new map field with the given key, in the chosen object. */
export interface MakeMapOperation extends BaseOperation {
  action: 'makeMap';
  /** Key at which to create the map field.
        Only present if `obj` points to a map.  */
  key: string;
}

export interface SetOperation extends BaseOperation {
  action: 'set';
  /** Field to set at the given path. */
  key: string;
  /** Value to set at the given field. */
  value: JsonPrimitive;
  /** To allow type refinements. */
  elemId?: undefined;
}

export interface DelOperation extends BaseOperation {
  action: 'del';
  /** Field to delete at the given path. */
  key: string;
  /** To allow type refinements. */
  elemId?: undefined;
}

export type Operation =
  | MakeListOperation
  | MakeMapOperation
  | SetOperation
  | DelOperation
  | InsertOperation
  | DeleteOperation
  | AddMarkOperation
  | RemoveMarkOperation;

/**
 * Tracks the operation ID that set each field.
 */
export type MapMetadata<M extends { [key: string]: Json }> = {
  // TODO: Metadata contains operation IDs for primitive fields only.
  // All composite fields are in the CHILDREN sub-object.
  // Really the type annotation we want is this:
  // M[K] extends JsonPrimitive
  //     ? OperationId
  //     : undefined
  // But we can't use it because we never actually know M,
  // so TypeScript resolves indexed lookups to `never`.
  [K in keyof M]?: OperationId /** Responsible for setting this field. */;
} & {
  // Maps all of the composite object fields to their object IDs.
  [CHILDREN]: {
    // TODO: Children map contains operation IDs for composite fields only.
    //    M[K] extends JsonComposite ? ObjectId : never
    [K in keyof M]?: ObjectId;
  };
};

/* really, this is peritext metadata because it has marks */
export type ListItemMetadata = {
  /** Operation that created the list item.
        NOTE: InputOperations are not internal Operations! One InsertInputOperation
        can produce multiple InsertOperations. The `elemId` corresponds to an
        internal InsertOperation. This is how we ensure that each `elemId` is unique,
        even when inserted as part of the same InsertInputOperation. */
  elemId: OperationId;
  /** Operation that last updated the list item.
        See `elemId` note about internal operations. */
  valueId: OperationId;
  /** Has the list item been deleted? */
  deleted: boolean;
  /** Mark operations in the gap before this list item */
  markOpsBefore?: Set<MarkOperation>;
  /** Mark operations in the gap after this list item */
  markOpsAfter?: Set<MarkOperation>;
};

export type ListMetadata = Array<ListItemMetadata>;

export type Metadata = ListMetadata | MapMetadata<Record<string, Json>>;
