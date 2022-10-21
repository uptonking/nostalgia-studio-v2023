/**
 * - Operation is essentially lists of ops，包含一个ops指令列表.
 * - 难点在 `op1.compose(op2)`，`static transform(op1, op2)`
 *
 * - 👇🏻 OT算法相关资料
 * - 将 operation 应用到字符串时，有一个隐形的光标位于字符串起点，retain 用于移动光标，
 *  insert和delete在光标所在位置对字符串进行字符向后插入和向后删除，
 *  operation应用完后，光标必须处于字符串的末端（这保证了应用operation的正确性）。
 * - 在严谨的OT算法实现中，delete 删除字符是要严格匹配的，但在实际实现如ot.js中，是直接删除指定长度的字符串。
 * - [SharedPen 之 Operational Transformation](http://objcer.com/2018/03/05/SharePen-Operational-Transformation/)
 */
export class TextOperation {
  /** Operation所包含的字符串操作指令，仅3种，字符串表示insert，正数表示retain，负数表示delete
   * - When an operation is applied to an input string, you can think of this as
   * if an imaginary cursor runs over the entire string and skips over some
   * parts, deletes some parts and inserts characters at some positions. These
   * actions (skip/delete/insert) are stored as an array in the "ops" property.
   */
  // ops: Array<string | number>;
  ops: any[];
  /** 在输入字符串上指针移动的长度/距离。
   * - An operation's baseLength is the length of every string the operation
   * can be applied to.
   */
  baseLength: number;
  /** 结果字符串的长度。
   * - The targetLength is the length of every string that results from applying
   * the operation on a valid input string.
   */
  targetLength: number;

  constructor() {
    this.ops = [];
    this.baseLength = 0;
    this.targetLength = 0;
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

  /** Retain ops: Advance the cursor position by a given number of characters.
   * - Represented by positive ints.
   * - baseLength和targetLength都会加N
   */
  retain(n: number): TextOperation {
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

  /** Insert ops: Insert a given string at the current cursor position.
   * - baseLength不变，targetLength加N
   * - op创建时会有一个虚拟光标位于字符的开头，在一个op结束时，光标一定要在字符串的末尾，其中insert会自动移动光标位置
   * ❓ 为什么要优先插入再删除， ...ins-del-ins 的序列转换成 ...ins-ins-del
   */
  insert(str: string): TextOperation {
    if (typeof str !== 'string') {
      throw new Error('insert expects a string');
    }
    if (str === '') {
      return this;
    }
    this.targetLength += str.length;

    const ops = this.ops;
    if (TextOperation.isInsert(ops[ops.length - 1])) {
      // /当下最后一个是insert则合并，ops长度不变，Merge insert op.
      ops[ops.length - 1] += str;
    } else if (TextOperation.isDelete(ops[ops.length - 1])) {
      // /当下最后一个是del则保持先insert再del，ops长度可能加1
      // It doesn't matter when an operation is applied whether the operation
      // is `delete(3), insert("something")` or `insert("something"), delete(3)`.
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.
      if (TextOperation.isInsert(ops[ops.length - 2])) {
        // ❓ 为什么要将 ...ins-del-ins 的序列转换成 ...ins-ins-del
        ops[ops.length - 2] += str;
      } else {
        // 类似 ...del2-del-ins 转换成 ...del2-ins-del
        ops[ops.length] = ops[ops.length - 1];
        ops[ops.length - 2] = str;
      }
    } else {
      // /当下最后一个操作是retain则添加一个op
      ops.push(str);
    }
    return this;
  }

  /** Delete ops: Delete the next n characters at the current position.
   * - Represented by negative ints.
   * - baseLength右移N，targetLength不变
   * - 参数可为正，但添加到指令数组ops中的delete操作为负数
   */
  delete(n: string | number): TextOperation {
    if (typeof n === 'string') {
      // 🔨 待优化，删除指定字符串的长度，且删除内容必须相同
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

  /** `operation.apply(inputStr)`，在inputStr上执行operation中包含的一系列指令。
   * - retain会复制指定长度字符串，insert会插入字符串，delete会向后移动虚拟指针
   * - operation应用完后，虚拟指针必须处于字符串末端，这使得op的compose/transform实现更简单清晰
   * - Apply an operation to a string, returning a new string. Throws an error if
   * there's a mismatch between the input string and the operation.
   */
  apply(str: string): string {
    const operation = this;
    if (str.length !== operation.baseLength) {
      // 👀 operation.baseLength必须等于输入str的长度
      throw new Error(
        "The operation's base length must be equal to the string's length.",
      );
    }
    /** 最后会返回的编辑操作得到的结果str */
    const retStr = [];
    /** retStr的元素索引 */
    let j = 0;
    /** 在输入str上的虚拟指针/位置索引，最后一定要和输入str同长度，否则异常 */
    let strIndex = 0;

    const ops = this.ops;
    for (let i = 0, len = ops.length; i < len; i++) {
      const currOp = ops[i];
      if (TextOperation.isRetain(currOp)) {
        if (strIndex + currOp > str.length) {
          throw new Error(
            "Operation can't retain more characters than are left in the string.",
          );
        }
        // Copy part of the old string.
        retStr[j++] = str.slice(strIndex, strIndex + currOp);
        strIndex += currOp;
      }
      if (TextOperation.isInsert(currOp)) {
        // Insert string.
        retStr[j++] = currOp;
      }
      if (TextOperation.isDelete(currOp)) {
        // delete op，位置索引增加，效果是跳过字符而向后移动虚拟指针
        strIndex -= currOp;
      }
    }

    if (strIndex !== str.length) {
      throw new Error("The operation didn't operate on the whole string.");
    }
    return retStr.join('');
  }

  /** 计算当前operation的inverse对象。依次遍历原指令，retain复制，insert转删除，delete转插入
   * - Computes the inverse of an operation. The inverse of an operation is the
   * operation that reverts the effects of the operation, e.g. when you have an
   * operation 'insert("hello "); skip(6);', then the inverse is 'delete("hello ");
   * skip(6);'. The inverse should be used for implementing undo.
   */
  invert(str: string): TextOperation {
    /** 在输入str上的虚拟指针始终向后移动 */
    let strIndex = 0;
    const inverse = new TextOperation();
    const ops = this.ops;
    for (let i = 0, len = ops.length; i < len; i++) {
      const op = ops[i];
      if (TextOperation.isRetain(op)) {
        inverse.retain(op);
        strIndex += op;
      }
      if (TextOperation.isInsert(op)) {
        inverse.delete(op.length);
      }
      if (TextOperation.isDelete(op)) {
        inverse.insert(str.slice(strIndex, strIndex - op));
        strIndex -= op;
      }
    }
    return inverse;
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
    // map: build a new array
    return Array.prototype.map
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

  /** Tests whether this operation has no effect. */
  isNoop() {
    return (
      this.ops.length === 0 ||
      (this.ops.length === 1 && TextOperation.isRetain(this.ops[0]))
    );
  }

  /** When you use ctrl-z to undo your latest changes, you expect the program not
   * to undo every single keystroke but to undo your last sentence you wrote at
   * a stretch or the deletion you did by holding the backspace key down. This
   * This can be implemented by composing operations on the undo stack. This
   * method can help decide whether two operations should be composed. It
   * returns true if the operations are consecutive insert operations or both
   * operations delete text at the same position. You may want to include other
   * factors like the time since the last change in your decision.
   */
  shouldBeComposedWith(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this);
    const startB = TextOperation.getStartIndex(other);
    const simpleA = TextOperation.getSimpleOp(this);
    const simpleB = TextOperation.getSimpleOp(other);
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

  /** Decides whether two operations should be composed with each other
   * if they were inverted, that is
   * `shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})`.
   */
  shouldBeComposedWithInverted(other: TextOperation) {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = TextOperation.getStartIndex(this);
    const startB = TextOperation.getStartIndex(other);
    const simpleA = TextOperation.getSimpleOp(this);
    const simpleB = TextOperation.getSimpleOp(other);
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

  /** 🤔 将operation2和当前op对象合并，注意操作有序 op1 -> op2，前提 op1.targetLength === op2.baseLength。
   * - compose的实现和transform类似，罗列两个OP所有的组合可能性，分别作出对应的逻辑处理
   * - 在合并过程中，始终要保证a和b是对当前字符串同一位置所进行的操作。
   * - compose一般是同一用户的两个操作且参数有序，transform一般是不同用户的两个操作且参数可无序
   * - Compose merges two consecutive operations into one operation, that
   * preserves the changes of both. Or, in other words, for each input string S
   * and a pair of consecutive operations A and B,
   * `apply(apply(S, A), B) = apply(S, compose(A, B))` must hold.
   */
  compose(operation2: TextOperation): TextOperation {
    const operation1 = this;
    if (operation1.targetLength !== operation2.baseLength) {
      throw new Error(
        'The base length of the second operation has to be the target length of the first operation',
      );
    }
    /** the combined operation to return */
    const combinedOperation = new TextOperation();
    const ops1 = operation1.ops;
    const ops2 = operation2.ops; // for fast access
    let i1 = 0;
    let i2 = 0;
    // current ops
    let op1 = ops1[i1++];
    let op2 = ops2[i2++];
    while (true) {
      // 👉🏻 👀 思路：合并A-B指令时，A-del和B-ins优先，插入和删除相同长度后结果为空故不输出指令
      // - A-retain和B-retain只保留retain公共长度，剩余的长度从insert、delete中计算
      // Dispatch on the type of op1 and op2
      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // /处理2个优先指令，A-del和B-ins，这在合并后一定会保留
      if (TextOperation.isDelete(op1)) {
        // a的删除操作是第一优先级，因为b的3操作(r/i/d)是基于a的操作之后进行的动作，因此需要先执行a的删除操作。
        combinedOperation.delete(op1);
        op1 = ops1[i1++];
        continue;
      }
      if (TextOperation.isInsert(op2)) {
        // b的插入操作是第二优先级，在相同位置下，b的添加操作，从结果上看，都是先于a的保留或者添加的。
        combinedOperation.insert(op2);
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

      // /去掉2个优先指令，还剩2x2=4种情况，A-i/r，B-d/r
      if (TextOperation.isRetain(op1) && TextOperation.isRetain(op2)) {
        // 如果A-retain/B-retain，retain两个op的公共长度
        if (op1 > op2) {
          combinedOperation.retain(op2);
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          combinedOperation.retain(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          combinedOperation.retain(op1);
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isInsert(op1) && TextOperation.isDelete(op2)) {
        // 如果A-insert/B-delete，那合并后的公共长度会为0，不输出指令，继续处理剩下的指令
        if (op1.length > -op2) {
          op1 = op1.slice(-op2); // 'abc'.slice(1) => 'bc'
          op2 = ops2[i2++];
        } else if (op1.length === -op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 = op2 + op1.length;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isInsert(op1) && TextOperation.isRetain(op2)) {
        // 如果A-insert/B-retain，那么我们就插入两个操作的公共长度，保留操作长度更长的部分，继续遍历
        if (op1.length > op2) {
          combinedOperation.insert(op1.slice(0, op2));
          op1 = op1.slice(op2);
          op2 = ops2[i2++];
        } else if (op1.length === op2) {
          combinedOperation.insert(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          combinedOperation.insert(op1);
          op2 = op2 - op1.length;
          op1 = ops1[i1++];
        }
      } else if (TextOperation.isRetain(op1) && TextOperation.isDelete(op2)) {
        // 如果A-retain/B-delete，那么我们就删除两个操作的公共长度，保留操作长度更长的剩余部分，继续遍历
        if (op1 > -op2) {
          combinedOperation.delete(op2);
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          combinedOperation.delete(op2);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          combinedOperation.delete(op1);
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

    return combinedOperation;
  }

  /** `Util.transform(a, b)`  ===  `a.transform(b)`
   * - (oA, oB) => [oA', oB']
   */
  transform(operation2: TextOperation): [TextOperation, TextOperation] {
    return TextOperation.transform(this, operation2);
  }

  //   OT算法核心transform
  //       docM      两客户端文档内容相同
  //     /      \
  //  A /        \ B
  //   /          \
  //   \          /
  //  B'\        / A'
  //     \      /
  //       docV      两客户端文档内容相同

  /** ot核心算法 (oA, oB) => [oA', oB']，前提是两操作的baseLength长度相同，版本也相同
   * - oB'.apply(oA.apply(str))  ===  oA'.apply(oB.apply(str)) 最终一致
   * - 核心原理是通过循环去将两个操作重新进行排列组合，按照操作的类型作出不同的逻辑处理
   * - 原子指令只有3种，组合起来最多9种情况
   * - 每个operation的baseLength必须和输入字符串相等，通过每轮循环虚拟指针移动相同距离实现
   * - Transform takes two operations A and B that happened concurrently and
   * produces two operations A' and B' (in an array) such that
   * `apply(apply(S, A), B') = apply(apply(S, B), A')`.
   * This function is the heart of OT.
   */
  static transform(
    operation1: TextOperation,
    operation2: TextOperation,
  ): [TextOperation, TextOperation] {
    if (operation1.baseLength !== operation2.baseLength) {
      // 必须保证操作的输入字符串长度相同
      throw new Error('Both operations have to have the same base length');
    }

    // 最后会返回 [oA'/operation1prime, oB'/operation2prime]
    const operation1prime = new TextOperation();
    const operation2prime = new TextOperation();
    const ops1 = operation1.ops;
    const ops2 = operation2.ops;
    let i1 = 0;
    let i2 = 0;
    let op1 = ops1[i1++];
    let op2 = ops2[i2++];
    while (true) {
      // 👉🏻 👀 原理：每次循环的起点，两op在输入字符串的虚拟指针位置相同，每轮虚拟指针移动距离也相同
      // 思路小结，两op的insert和公共retain长度不变，然后计算新的retain和delete
      // At every iteration of the loop, the imaginary cursor that both
      // operation1 and operation2 have that operates on the input string must
      // have the same position in the input string.

      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // 优先插入指令，如果oA/oB中至少一个是插入指令，就执行一个插入，另一个直接retain移动光标；
      // 还剩下2x2=4种情况，A-r/d，B-r/d
      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      if (TextOperation.isInsert(op1)) {
        // 若oA是插入，则oA'一定也是插入，此时oB'👀只移动，因为oB'肯定不是删除，要保证本轮虚指针移动相同距离
        operation1prime.insert(op1);
        operation2prime.retain(op1.length);
        op1 = ops1[i1++];
        continue;
      }
      if (TextOperation.isInsert(op2)) {
        operation2prime.insert(op2);
        operation1prime.retain(op2.length);
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

      let minLen: number;
      if (TextOperation.isRetain(op1) && TextOperation.isRetain(op2)) {
        // A-retain/B-retain，则retain公共长度
        if (op1 > op2) {
          minLen = op2;
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          minLen = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minLen = op1;
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
        operation1prime.retain(minLen);
        operation2prime.retain(minLen);
      } else if (TextOperation.isDelete(op1) && TextOperation.isDelete(op2)) {
        // A-delete/B-delete，因为前面insert占用了长度，公共的删除就不产生指令
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
      } else if (TextOperation.isDelete(op1) && TextOperation.isRetain(op2)) {
        // A-delete/B-retain，A'应该删除，B'因为insert占用了retain，此时B'不retain
        if (-op1 > op2) {
          minLen = op2;
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (-op1 === op2) {
          minLen = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minLen = -op1;
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
        operation1prime.delete(minLen);
      } else if (TextOperation.isRetain(op1) && TextOperation.isDelete(op2)) {
        // A-retain/B-delete，B'应该删除，A'因为insert占用了retain，此时A'不retain
        if (op1 > -op2) {
          minLen = -op2;
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          minLen = op1;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minLen = op1;
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
        operation2prime.delete(minLen);
      } else {
        throw new Error("The two operations aren't compatible");
      }
    }

    return [operation1prime, operation2prime];
  }

  /** Converts a plain JS object into an operation and validates it.
   */
  static fromJSON(ops: any[]): TextOperation {
    const o = new TextOperation();
    for (let i = 0, len = ops.length; i < len; i++) {
      const op = ops[i];
      if (TextOperation.isRetain(op)) {
        o.retain(op);
      } else if (TextOperation.isInsert(op)) {
        o.insert(op);
      } else if (TextOperation.isDelete(op)) {
        o.delete(op);
      } else {
        throw new Error('unknown operation: ' + JSON.stringify(op));
      }
    }
    return o;
  }

  /** 仅用在 shouldBeComposedWith/shouldBeComposedWithInverted */
  static getSimpleOp(operation: TextOperation, fn?: any) {
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

  /** 仅用在 shouldBeComposedWith/shouldBeComposedWithInverted */
  static getStartIndex(operation: TextOperation) {
    if (TextOperation.isRetain(operation.ops[0])) {
      return operation.ops[0];
    }
    return 0;
  }
}
