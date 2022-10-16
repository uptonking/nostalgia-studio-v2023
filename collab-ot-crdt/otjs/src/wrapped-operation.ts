import { TextOperation } from './text-operation';

/**
 * A WrappedOperation contains an operation and corresponding metadata.
 */
export class WrappedOperation {
  /** 对应的基础TextOperation */
  wrapped: TextOperation;
  meta: any;

  constructor(operation: TextOperation, meta) {
    this.wrapped = operation;
    this.meta = meta;
  }

  // apply() {
  //   return this.wrapped.apply.apply(this.wrapped, arguments);
  // }

  apply(str: string) {
    return this.wrapped.apply.apply(this.wrapped, str);
  }

  invert() {
    const meta = this.meta;
    return new WrappedOperation(
      this.wrapped.invert.apply(this.wrapped, arguments),
      meta && typeof meta === 'object' && typeof meta.invert === 'function'
        ? meta.invert.apply(meta, arguments)
        : meta,
    );
  }

  compose(other: WrappedOperation) {
    return new WrappedOperation(
      this.wrapped.compose(other.wrapped),
      composeMeta(this.meta, other.meta),
    );
  }

  static transform(a: WrappedOperation, b: WrappedOperation) {
    // const transform = a.wrapped.constructor.transform;
    const transform = TextOperation.transform;
    const pair = transform(a.wrapped, b.wrapped);
    return [
      new WrappedOperation(pair[0], transformMeta(a.meta, b.wrapped)),
      new WrappedOperation(pair[1], transformMeta(b.meta, a.wrapped)),
    ];
  }
}

/** Copy all properties from source to target. */
function copy(source: Record<string, any>, target: Record<string, any>) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}

function composeMeta(a, b) {
  if (a && typeof a === 'object') {
    if (typeof a.compose === 'function') {
      return a.compose(b);
    }
    const meta = {};
    copy(a, meta);
    copy(b, meta);
    return meta;
  }

  return b;
}

function transformMeta(meta, operation) {
  if (meta && typeof meta === 'object') {
    if (typeof meta.transform === 'function') {
      return meta.transform(operation);
    }
  }
  return meta;
}
