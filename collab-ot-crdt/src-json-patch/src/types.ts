/**
 * json patch props + from
 */
export interface JSONPatchOp {
  op: string;
  path: string;
  value?: any;
  from?: string;
}

export interface JSONPatchOpHandler {
  like: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  apply(
    path: string,
    value: any,
    from?: string,
    createMissingObjects?: boolean,
  ): string | void;
  transform(other: JSONPatchOp, ops: JSONPatchOp[]): JSONPatchOp[];
  invert(
    op: JSONPatchOp,
    value: any,
    changedObj: any,
    isIndex: boolean,
  ): JSONPatchOp;
  compose?(value1: any, value2: any): any;
}

export interface JSONPatchOpHandlerMap {
  [key: string]: JSONPatchOpHandler;
}

export interface ApplyJSONPatchOptions {
  partial?: boolean; // do not reject patches if error occurs (partial patching)
  strict?: boolean; // throw an exception if error occurs when patching
  rigid?: boolean; // stop on error and return the original object
  silent?: boolean; // don't log errors when they occurs during patching
  error?: JSONPatchOp; // saves the patch that caused the error
  atPath?: string; // apply changes at a given path prefix
  createMissingObjects?: boolean; // create empty objects when a path needs them to resolve
}

export interface Root {
  '': any;
}
