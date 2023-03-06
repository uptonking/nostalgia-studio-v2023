/*!
 * Based on work from
 * https://github.com/mohayonao/json-touch-patch
 * (c) 2018 mohayonao
 *
 * MIT license
 * (c) 2022 Jacob Wright
 *
 *
 * WARNING: using /array/- syntax to indicate the end of the array makes it impossible to transform arrays correctly in
 * all situaions. Please avoid using this syntax when using Operational Transformations.
 */

import type {
  JSONPatchOp,
  JSONPatchOpHandlerMap,
  ApplyJSONPatchOptions,
} from './types';
import { applyPatch } from './applyPatch';
import { transformPatch } from './transformPatch';
import { invertPatch } from './invertPatch';
import { composePatch } from './composePatch';

/**
 * A JSONPatch helps with creating and applying one or more "JSON patches". It can track one or more changes
 * together which may form a single operation or transaction.
 */
export class JSONPatch {
  ops: JSONPatchOp[];
  custom: JSONPatchOpHandlerMap;

  /**
   * Create a new JSONPatch, optionally with an existing array of operations.
   */
  constructor(ops: JSONPatchOp[] = [], custom: JSONPatchOpHandlerMap = {}) {
    this.ops = ops;
    this.custom = custom;
  }

  op(op: string, path: string, value?: any, from?: string) {
    checkPath(path);
    if (from !== undefined) checkPath(from);
    const patchOp: JSONPatchOp = from ? { op, from, path } : { op, path };
    if (value !== undefined) patchOp.value = value;
    this.ops.push(patchOp);
    return this;
  }

  /**
   * Tests a value exists. If it doesn't, the patch is not applied.
   */
  test(path: string, value: any) {
    return this.op('test', path, value);
  }

  /**
   * Adds the value to an object or array, inserted before the given index.
   */
  add(path: string, value: any) {
    if (value && value.toJSON) value = value.toJSON();
    return this.op('add', path, value);
  }

  /**
   * Deletes the value at the given path or removes it from an array.
   */
  remove(path: string) {
    return this.op('remove', path);
  }

  /**
   * Replaces a value (same as remove+add).
   */
  replace(path: string, value: any) {
    if (value && value.toJSON) value = value.toJSON();
    return this.op('replace', path, value);
  }

  /**
   * Copies the value at `from` to `path`.
   */
  copy(from: string, to: string) {
    return this.op('copy', to, undefined, from);
  }

  /**
   * Moves the value at `from` to `path`.
   */
  move(from: string, to: string) {
    if (from === to) return this;
    return this.op('move', to, undefined, from);
  }

  /**
   * Increments a numeric value by 1 or the given amount.
   */
  increment(path: string, value: number = 1) {
    return this.op('@inc', path, value);
  }

  /**
   * Decrements a numeric value by 1 or the given amount.
   */
  decrement(path: string, value: number = 1) {
    return this.op('@inc', path, -value);
  }

  /**
   * Creates a patch from an object partial, updating each field. Set a field to undefined to delete it.
   */
  addUpdates(updates: { [key: string]: any }, path = '/') {
    if (path[path.length - 1] !== '/') path += '/';
    Object.keys(updates).forEach((key) => {
      const value = updates[key];
      if (value == undefined) {
        this.remove(path + key);
      } else {
        this.replace(path + key, value);
      }
    });
    return this;
  }

  /**
   * This will ensure an "add empty object" operation is created for each property along the path that does not exist.
   */
  addObjectsInPath(obj: any, path: string) {
    checkPath(path);
    const parts = path.split('/');
    for (var i = 1; i < parts.length - 1; i++) {
      const prop = parts[i];
      if (!obj || !obj[prop]) {
        this.add(parts.slice(0, i + 1).join('/'), {});
      }
      obj = obj && obj[prop];
    }
    return this;
  }

  /**
   * Apply this patch to an object, returning a new object with the applied changes (or the same object if nothing
   * changed in the patch). Optionally apply the page at the given path prefix.
   */
  apply<T>(obj: T, options?: ApplyJSONPatchOptions): T {
    return applyPatch(obj, this.ops, options, this.custom);
  }

  /**
   * Transform the given patch against this one. This patch is considered to have happened first
   */
  transform(obj: any, patch: JSONPatch | JSONPatchOp[]): this {
    const JSONPatch = this.constructor as any;
    return new JSONPatch(
      transformPatch(
        obj,
        this.ops,
        Array.isArray(patch) ? patch : patch.ops,
        this.custom,
      ),
      this.custom,
    );
  }

  /**
   * Create a patch which can reverse what this patch does. Because JSON Patches do not store previous values, you
   * must provide the previous object to create a reverse patch.
   */
  invert(obj: any): this {
    const JSONPatch = this.constructor as any;
    return new JSONPatch(invertPatch(obj, this.ops, this.custom), this.custom);
  }

  /**
   * Compose/collapse patches into fewer operations.
   */
  compose(patch?: JSONPatch | JSONPatchOp[]): this {
    const JSONPatch = this.constructor as any;
    let ops = this.ops;
    if (patch) ops = ops.concat(Array.isArray(patch) ? patch : patch.ops);
    return new JSONPatch(composePatch(ops), this.custom);
  }

  /**
   * Add two patches together.
   */
  concat(patch: JSONPatch | JSONPatchOp[]): this {
    const JSONPatch = this.constructor as any;
    return new JSONPatch(
      this.ops.concat(Array.isArray(patch) ? patch : patch.ops),
      this.custom,
    );
  }

  /**
   * Returns an array of patch operations.
   */
  toJSON() {
    return this.ops.slice();
  }

  /**
   * Create a new JSONPatch with the provided JSON patch operations.
   */
  static fromJSON<T>(
    this: { new (ops?: JSONPatchOp[], types?: JSONPatchOpHandlerMap): T },
    ops?: JSONPatchOp[],
    types?: JSONPatchOpHandlerMap,
  ): T {
    return new this(ops, types);
  }
}

function checkPath(path: string) {
  if (path.length && path[0] !== '/')
    throw new TypeError('JSON Patch paths must begin with "/"');
}
