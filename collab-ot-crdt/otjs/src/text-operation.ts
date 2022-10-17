export class TextOperation {
  ops: any[];
  baseLength: number;
  targetLength: number;

  constructor() {
    this.ops = [];
    this.baseLength = 0;
    this.targetLength = 0;
  }

  retain(n: any) {
    if (typeof n !== 'number') {
      throw new Error('retain expects an integer');
    }
    if (n === 0) {
      return this;
    }
    this.baseLength += n;
    this.targetLength += n;
    if (TextOperation.isRetain(this.ops[this.ops.length - 1])) {
      // The last op is a retain op => we can merge them into one op.
      this.ops[this.ops.length - 1] += n;
    } else {
      // Create a new op.
      this.ops.push(n);
    }
    return this;
  }

  insert(str: string) {
    if (typeof str !== 'string') {
      throw new Error('insert expects a string');
    }
    if (str === '') {
      return this;
    }
    this.targetLength += str.length;
    const ops = this.ops;
    if (TextOperation.isInsert(ops[ops.length - 1])) {
      // Merge insert op.
      ops[ops.length - 1] += str;
    } else if (TextOperation.isDelete(ops[ops.length - 1])) {
      // It doesn't matter when an operation is applied whether the operation
      // is delete(3), insert("something") or insert("something"), delete(3).
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.
      if (TextOperation.isInsert(ops[ops.length - 2])) {
        ops[ops.length - 2] += str;
      } else {
        ops[ops.length] = ops[ops.length - 1];
        ops[ops.length - 2] = str;
      }
    } else {
      ops.push(str);
    }
    return this;
  }

  delete(n: any) {
    if (typeof n === 'string') {
      n = n.length;
    }
    if (typeof n !== 'number') {
      throw new Error('delete expects an integer or a string');
    }
    if (n === 0) {
      return this;
    }
    if (n > 0) {
      n = -n;
    }
    this.baseLength -= n;
    if (TextOperation.isDelete(this.ops[this.ops.length - 1])) {
      this.ops[this.ops.length - 1] += n;
    } else {
      this.ops.push(n);
    }
    return this;
  }

  apply(str: string) {
    const operation = this;
    if (str.length !== operation.baseLength) {
      throw new Error(
        "The operation's base length must be equal to the string's length.",
      );
    }
    let newStr = [],
      j = 0;
    let strIndex = 0;
    const ops = this.ops;
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (TextOperation.isRetain(op)) {
        if (strIndex + op > str.length) {
          throw new Error(
            "Operation can't retain more characters than are left in the string.",
          );
        }
        // Copy skipped part of the old string.
        newStr[j++] = str.slice(strIndex, strIndex + op);
        strIndex += op;
      } else if (TextOperation.isInsert(op)) {
        // Insert string.
        newStr[j++] = op;
      } else {
        // delete op
        strIndex -= op;
      }
    }
    if (strIndex !== str.length) {
      throw new Error("The operation didn't operate on the whole string.");
    }
    return newStr.join('');
  }

  invert(str: string) {
    let strIndex = 0;
    const inverse = new TextOperation();
    const ops = this.ops;
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (TextOperation.isRetain(op)) {
        inverse.retain(op);
        strIndex += op;
      } else if (TextOperation.isInsert(op)) {
        inverse['delete'](op.length);
      } else {
        // delete op
        inverse.insert(str.slice(strIndex, strIndex - op));
        strIndex -= op;
      }
    }
    return inverse;
  }

  compose(operation2: any) {
    const operation1 = this;
    if (operation1.targetLength !== operation2.baseLength) {
      throw new Error(
        'The base length of the second operation has to be the target length of the first operation',
      );
    }

    const operation = new TextOperation(); // the combined operation
    const ops1 = operation1.ops,
      ops2 = operation2.ops; // for fast access
    let i1 = 0,
      i2 = 0; // current index into ops1 respectively ops2
    let op1 = ops1[i1++],
      op2 = ops2[i2++]; // current ops
    while (true) {
      // Dispatch on the type of op1 and op2
      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      if (TextOperation.isDelete(op1)) {
        operation['delete'](op1);
        op1 = ops1[i1++];
        continue;
      }
      if (TextOperation.isInsert(op2)) {
        operation.insert(op2);
        op2 = ops2[i2++];
        continue;
      }

      if (typeof op1 === 'undefined') {
        throw new Error(
          'Cannot compose operations: first operation is too short.',
        );
      }
      if (typeof op2 === 'undefined') {
        throw new Error(
          'Cannot compose operations: first operation is too long.',
        );
      }

      if (TextOperation.isRetain(op1) && TextOperation.isRetain(op2)) {
        if (op1 > op2) {
          operation.retain(op2);
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          operation.retain(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.retain(op1);
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isInsert(op1) && TextOperation.isDelete(op2)) {
        if (op1.length > -op2) {
          op1 = op1.slice(-op2);
          op2 = ops2[i2++];
        } else if (op1.length === -op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 = op2 + op1.length;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isInsert(op1) && TextOperation.isRetain(op2)) {
        if (op1.length > op2) {
          operation.insert(op1.slice(0, op2));
          op1 = op1.slice(op2);
          op2 = ops2[i2++];
        } else if (op1.length === op2) {
          operation.insert(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.insert(op1);
          op2 = op2 - op1.length;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isRetain(op1) && TextOperation.isDelete(op2)) {
        if (op1 > -op2) {
          operation['delete'](op2);
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          operation['delete'](op2);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation['delete'](op1);
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
      } else {
        throw new Error(
          "This shouldn't happen: op1: " +
          JSON.stringify(op1) +
          ', op2: ' +
          JSON.stringify(op2),
        );
      }
    }
    return operation;
  }

  equals(other: TextOperation) {
    if (this.baseLength !== other.baseLength) {
      return false;
    }
    if (this.targetLength !== other.targetLength) {
      return false;
    }
    if (this.ops.length !== other.ops.length) {
      return false;
    }
    for (let i = 0; i < this.ops.length; i++) {
      if (this.ops[i] !== other.ops[i]) {
        return false;
      }
    }
    return true;
  }

  toString() {
    // map: build a new array by applying a function to every element in an old
    // array.
    const map =
      Array.prototype.map ||
      function (fn) {
        // @ts-ignore
        const arr = this;
        const newArr = [];
        for (let i = 0, l = arr.length; i < l; i++) {
          // @ts-ignore
          newArr[i] = fn(arr[i]);
        }
        return newArr;
      };
    return map
      .call(this.ops, function (op) {
        if (TextOperation.isRetain(op)) {
          return 'retain ' + op;
        } else if (TextOperation.isInsert(op)) {
          return "insert '" + op + "'";
        } else {
          return 'delete ' + -op;
        }
      })
      .join(', ');
  }

  /** 注意返回值不是字符串，而是数组。Converts operation into a JSON value. */
  toJSON() {
    return this.ops;
  }

  isNoop() {
    return (
      this.ops.length === 0 ||
      (this.ops.length === 1 && TextOperation.isRetain(this.ops[0]))
    );
  }

  shouldBeComposedWith(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this),
      startB = TextOperation.getStartIndex(other);
    const simpleA = TextOperation.getSimpleOp(this),
      simpleB = TextOperation.getSimpleOp(other);
    if (!simpleA || !simpleB) {
      return false;
    }

    if (TextOperation.isInsert(simpleA) && TextOperation.isInsert(simpleB)) {
      return startA + simpleA.length === startB;
    }

    if (TextOperation.isDelete(simpleA) && TextOperation.isDelete(simpleB)) {
      // there are two possibilities to delete: with backspace and with the
      // delete key.
      return startB - simpleB === startA || startA === startB;
    }

    return false;
  }

  shouldBeComposedWithInverted(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this),
      startB = TextOperation.getStartIndex(other);
    const simpleA = TextOperation.getSimpleOp(this),
      simpleB = TextOperation.getSimpleOp(other);
    if (!simpleA || !simpleB) {
      return false;
    }

    if (TextOperation.isInsert(simpleA) && TextOperation.isInsert(simpleB)) {
      return startA + simpleA.length === startB || startA === startB;
    }

    if (TextOperation.isDelete(simpleA) && TextOperation.isDelete(simpleB)) {
      return startB - simpleB === startA;
    }

    return false;
  }

  static transform(operation1: TextOperation, operation2: TextOperation) {
    if (operation1.baseLength !== operation2.baseLength) {
      throw new Error('Both operations have to have the same base length');
    }

    const operation1prime = new TextOperation();
    const operation2prime = new TextOperation();
    const ops1 = operation1.ops,
      ops2 = operation2.ops;
    let i1 = 0,
      i2 = 0;
    let op1 = ops1[i1++],
      op2 = ops2[i2++];
    while (true) {
      // At every iteration of the loop, the imaginary cursor that both
      // operation1 and operation2 have that operates on the input string must
      // have the same position in the input string.

      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      if (TextOperation.isInsert(op1)) {
        operation1prime.insert(op1);
        operation2prime.retain(op1.length);
        op1 = ops1[i1++];
        continue;
      }
      if (TextOperation.isInsert(op2)) {
        operation1prime.retain(op2.length);
        operation2prime.insert(op2);
        op2 = ops2[i2++];
        continue;
      }

      if (typeof op1 === 'undefined') {
        throw new Error(
          'Cannot compose operations: first operation is too short.',
        );
      }
      if (typeof op2 === 'undefined') {
        throw new Error(
          'Cannot compose operations: first operation is too long.',
        );
      }

      var minl;
      if (TextOperation.isRetain(op1) && TextOperation.isRetain(op2)) {
        // Simple case: retain/retain
        if (op1 > op2) {
          minl = op2;
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
        operation1prime.retain(minl);
        operation2prime.retain(minl);
      } else if (TextOperation.isDelete(op1) && TextOperation.isDelete(op2)) {
        // Both operations delete the same string at the same position. We don't
        // need to produce any operations, we just skip over the delete ops and
        // handle the case that one operation deletes more than the other.
        if (-op1 > -op2) {
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
        // next two cases: delete/retain and retain/delete
      } else if (TextOperation.isDelete(op1) && TextOperation.isRetain(op2)) {
        if (-op1 > op2) {
          minl = op2;
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (-op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = -op1;
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
        operation1prime['delete'](minl);
      } else if (TextOperation.isRetain(op1) && TextOperation.isDelete(op2)) {
        if (op1 > -op2) {
          minl = -op2;
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          minl = op1;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
        operation2prime['delete'](minl);
      } else {
        throw new Error("The two operations aren't compatible");
      }
    }

    return [operation1prime, operation2prime];
  }

  static fromJSON(ops: any) {
    const o = new TextOperation();
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (TextOperation.isRetain(op)) {
        o.retain(op);
      } else if (TextOperation.isInsert(op)) {
        o.insert(op);
      } else if (TextOperation.isDelete(op)) {
        o['delete'](op);
      } else {
        throw new Error('unknown operation: ' + JSON.stringify(op));
      }
    }
    return o;
  }

  static isRetain(op: any) {
    return typeof op === 'number' && op > 0;
  }

  static isInsert(op: any) {
    return typeof op === 'string';
  }

  static isDelete(op: any) {
    return typeof op === 'number' && op < 0;
  }

  static getSimpleOp(operation, fn?: any) {
    const ops = operation.ops;
    const isRetain = TextOperation.isRetain;
    switch (ops.length) {
      case 1:
        return ops[0];
      case 2:
        return isRetain(ops[0]) ? ops[1] : isRetain(ops[1]) ? ops[0] : null;
      case 3:
        if (isRetain(ops[0]) && isRetain(ops[2])) {
          return ops[1];
        }
    }
    return null;
  }

  static getStartIndex(operation) {
    if (TextOperation.isRetain(operation.ops[0])) {
      return operation.ops[0];
    }
    return 0;
  }
}
