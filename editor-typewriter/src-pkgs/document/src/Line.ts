import { Delta } from '@typewriter/delta';

import type { Line, LineIds } from './lineUtils';
import * as lineUtils from './lineUtils';

const INFINITY = {
  id: '',
  attributes: {},
  content: new Delta([{ retain: Infinity }]),
  length: Infinity,
};

export function iterator(lines: Line[], lineIds?: LineIds) {
  return new LineIterator(lines, lineIds);
}

export class LineIterator {
  lines: Line[];
  index: number;
  offset: number;
  lineIds: LineIds;

  constructor(lines: Line[], lineIds?: LineIds) {
    this.lines = lines;
    this.index = 0;
    this.offset = 0;
    this.lineIds = lineIds ? new Map(lineIds) : lineUtils.linesToLineIds(lines);
  }

  hasNext(): boolean {
    return Boolean(this.peek());
  }

  next(length?: number): Line {
    if (!length) {
      length = Infinity;
    }
    const nextLine = this.lines[this.index];
    if (nextLine) {
      const offset = this.offset;
      const lineLength = nextLine.length;
      if (length >= lineLength - offset) {
        length = lineLength - offset;
        this.index += 1;
        this.offset = 0;
      } else {
        this.offset += length;
      }
      if (offset === 0 && length >= nextLine.length) {
        return nextLine;
      } else {
        const id =
          offset === 0 ? nextLine.id : lineUtils.createId(this.lineIds);
        const partialLine = {
          id,
          attributes: nextLine.attributes,
          content: nextLine.content.slice(offset, length),
          length: length - offset,
        };
        if (offset !== 0) this.lineIds.set(id, partialLine);
        return partialLine;
      }
    } else {
      return INFINITY;
    }
  }

  peek(): Line {
    return this.lines[this.index];
  }

  peekLength(): number {
    if (this.lines[this.index]) {
      // Should never return 0 if our index is being managed correctly
      return this.lines[this.index].length - this.offset;
    } else {
      return Infinity;
    }
  }

  rest(): Line[] {
    if (!this.hasNext()) {
      return [];
    } else if (this.offset === 0) {
      return this.lines.slice(this.index);
    } else {
      const offset = this.offset;
      const index = this.index;
      const next = this.next();
      const rest = this.lines.slice(this.index);
      this.offset = offset;
      this.index = index;
      return [next].concat(rest);
    }
  }
}
