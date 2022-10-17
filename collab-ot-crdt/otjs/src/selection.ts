import { TextOperation } from './text-operation';

export class Range {
  anchor: number;
  head: number;

  constructor(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  }

  transform(other: TextOperation) {
    function transformIndex(index) {
      let newIndex = index;
      const ops = other.ops;
      for (let i = 0, l = other.ops.length; i < l; i++) {
        if (TextOperation.isRetain(ops[i])) {
          index -= ops[i];
        } else if (TextOperation.isInsert(ops[i])) {
          newIndex += ops[i].length;
        } else {
          newIndex -= Math.min(index, -ops[i]);
          index += ops[i];
        }
        if (index < 0) {
          break;
        }
      }
      return newIndex;
    }

    const newAnchor = transformIndex(this.anchor);
    if (this.anchor === this.head) {
      return new Range(newAnchor, newAnchor);
    }
    return new Range(newAnchor, transformIndex(this.head));
  }
  equals(other: Range) {
    return this.anchor === other.anchor && this.head === other.head;
  }

  isEmpty() {
    return this.anchor === this.head;
  }

  static fromJSON(obj) {
    return new Range(obj.anchor, obj.head);
  }
}

export class Selection {
  ranges: Range[];
  position: any;
  // static Range: any;

  constructor(ranges) {
    this.ranges = ranges || [];
  }

  equals(other) {
    if (this.position !== other.position) {
      return false;
    }
    if (this.ranges.length !== other.ranges.length) {
      return false;
    }
    // FIXME: Sort ranges before comparing them?
    for (let i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].equals(other.ranges[i])) {
        return false;
      }
    }
    return true;
  }

  somethingSelected() {
    for (let i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].isEmpty()) {
        return true;
      }
    }
    return false;
  }

  compose(other) {
    return other;
  }

  transform(other) {
    for (var i = 0, newRanges = []; i < this.ranges.length; i++) {
      newRanges[i] = this.ranges[i].transform(other);
    }
    return new Selection(newRanges);
  }

  static createCursor(position) {
    return new Selection([new Range(position, position)]);
  }

  static fromJSON(obj) {
    const objRanges = obj.ranges || obj;
    for (var i = 0, ranges = []; i < objRanges.length; i++) {
      ranges[i] = Range.fromJSON(objRanges[i]);
    }
    return new Selection(ranges);
  }
}
