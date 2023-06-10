import {
  AttributeMap,
  type AttributeMapType,
  Delta,
  isEqual,
  Op,
} from '@typewriter/delta';

import { deltaToText } from './deltaToText';
import { type EditorRange, normalizeRange } from './editorRange';
import { iterator as lineIterator } from './Line';
import * as lineOpUtils from './lineOpUtils';
import { type Line, type LineIds, type LineRanges } from './lineUtils';
import * as lineUtils from './lineUtils';
import { TextChange } from './TextChange';

const EMPTY_RANGE: EditorRange = [0, 0];
const EMPTY_OBJ = {};
const DELTA_CACHE = new WeakMap<TextDocument, Delta>();
const excludeProps = new Set(['id']);

export interface FormattingOptions {
  nameOnly?: boolean;
  allFormats?: boolean;
}

/**
 * Text Document represents editor contents and user selection in memory
 * - `TextDocument` can be converted to and from `Delta`, so it can be used temporarily.
 * - `TextDocument` splits a `Delta` document into its lines allowing for performance optimizations which are noticeable in large documents.
 */
export class TextDocument {
  /** editor content by blocks/lines */
  lines: Line[];
  /** { lineObj, rangeInEditor }, ❓ why not lineId */
  private _ranges: LineRanges;
  /** { lineId, lineObj } */
  byId: LineIds;
  /** total character count of all lines, including \n */
  length: number;
  /** current selection */
  selection: EditorRange | null;

  /** init editor lines and selection */
  constructor(
    linesOrDocOrDelta?: TextDocument | Line[] | Delta,
    selection: EditorRange | null = null,
  ) {
    if (
      linesOrDocOrDelta &&
      linesOrDocOrDelta instanceof TextDocument &&
      linesOrDocOrDelta.lines
    ) {
      const textDocument = linesOrDocOrDelta;
      this.lines = textDocument.lines;
      this.byId = textDocument.byId;
      this._ranges = textDocument._ranges;
      this.length = textDocument.length;
    } else {
      this.byId = new Map();
      if (linesOrDocOrDelta && Array.isArray(linesOrDocOrDelta)) {
        this.lines = linesOrDocOrDelta as Line[];
      } else if (linesOrDocOrDelta) {
        this.lines = lineUtils.fromDelta(linesOrDocOrDelta as Delta);
      } else {
        this.lines = [lineUtils.create()];
      }
      if (!this.lines.length) {
        this.lines.push(lineUtils.create());
      }
      this.byId = lineUtils.linesToLineIds(this.lines);
      // Check for line id duplicates (should never happen, indicates bug)
      this.lines.forEach((line) => {
        if (this.byId.get(line.id) !== line)
          throw new Error('TextDocument has duplicate line ids: ' + line.id);
      });
      this._ranges = lineUtils.getLineRanges(this.lines);
      // @ts-ignore ide complaint
      this.length = this.lines.reduce<number>(
        (length, line) => length + line.length,
        0,
      );
    }
    this.selection =
      selection &&
      (selection.map((pointIndex) =>
        Math.min(this.length - 1, Math.max(0, pointIndex)),
      ) as EditorRange);
  }

  /** create a new TextChange obj */
  get change() {
    const change = new TextChange(this);
    change.apply = () => this.apply(change);
    return change;
  }

  getText(range?: EditorRange): string {
    if (range) range = normalizeRange(range);
    return deltaToText(
      range ? this.slice(range[0], range[1]) : this.slice(0, this.length - 1),
    );
  }

  getLineBy(id: string) {
    return this.byId.get(id) as Line;
  }

  getLineAt(at: number) {
    return this.lines.find((line) => {
      const [start, end] = this.getLineRange(line);
      return start <= at && end > at;
    }) as Line;
  }

  getLinesAt(at: number | EditorRange, encompassed?: boolean) {
    let to = at as number;
    if (Array.isArray(at)) [at, to] = normalizeRange(at);

    return this.lines.filter((line) => {
      const [start, end] = this.getLineRange(line);

      return encompassed
        ? start >= Number(at) && end <= Number(to)
        : (start < to || start === at) && end > Number(at);
    });
  }

  getLineRange(at: number | string | Line): EditorRange {
    const { lines, _ranges: lineRanges } = this;
    if (typeof at === 'number') {
      for (let i = 0; i < lines.length; i++) {
        const range = lineRanges.get(lines[i]) || EMPTY_RANGE;
        if (range[0] <= at && range[1] > at) return range;
      }
      return EMPTY_RANGE;
    } else {
      if (typeof at === 'string') at = this.getLineBy(at);
      return lineRanges.get(at) as EditorRange;
    }
  }

  getLineRanges(at?: number | EditorRange) {
    if (at == null) {
      return Array.from(this._ranges.values());
    } else {
      return this.getLinesAt(at).map((line) => this.getLineRange(line));
    }
  }

  getLineFormat(
    at: number | EditorRange = this.selection as EditorRange,
    options?: FormattingOptions,
  ) {
    let to = at as number;
    if (Array.isArray(at)) [at, to] = normalizeRange(at);
    if (at === to) to++;
    return getAttributes(
      { iterator: lineIterator, ...lineUtils },
      this.lines,
      at,
      to,
      undefined,
      options,
    );
  }

  getTextFormat(
    at: number | EditorRange = this.selection as EditorRange,
    options?: FormattingOptions,
  ) {
    let to = at as number;
    if (Array.isArray(at)) [at, to] = normalizeRange(at);
    if (at === to) at--;
    return getAttributes(
      lineOpUtils,
      this.lines,
      at,
      to,
      (op) => op.insert !== '\n',
      options,
    );
  }

  getFormats(
    at: number | EditorRange = this.selection as EditorRange,
    options?: FormattingOptions,
  ): AttributeMapType {
    return {
      ...this.getTextFormat(at, options),
      ...this.getLineFormat(at, options),
    };
  }

  slice(start = 0, end = Infinity): Delta {
    const ops: Op[] = [];
    const iter = lineOpUtils.iterator(this.lines);
    let index = 0;
    while (index < end && iter.hasNext()) {
      let nextOp: Op;
      if (index < start) {
        nextOp = iter.next(start - index);
      } else {
        nextOp = iter.next(end - index);
        ops.push(nextOp);
      }
      index += Op.length(nextOp);
    }
    return new Delta(ops);
  }

  apply(
    change: Delta | TextChange,
    selection?: EditorRange | null,
    throwOnError?: boolean,
  ): TextDocument {
    let delta: Delta;
    if ((change as TextChange).delta) {
      delta = (change as TextChange).delta;
      selection = (change as TextChange).selection;
    } else {
      delta = change as Delta;
    }

    // If no change, do nothing
    if (
      !delta.ops.length &&
      (selection === undefined || isEqual(this.selection, selection))
    ) {
      return this;
    }

    // Optimization for selection-only change
    if (!delta.ops.length && selection) {
      return new TextDocument(this, selection);
    }

    if (selection === undefined && this.selection) {
      selection = [
        delta.transformPosition(this.selection[0]),
        delta.transformPosition(this.selection[1]),
      ];
      // If the selection hasn't changed, keep the original reference
      if (isEqual(this.selection, selection)) {
        selection = this.selection;
      }
    }

    const thisIter = lineOpUtils.iterator(this.lines, this.byId);
    const otherIter = Op.iterator(delta.ops);
    const lines: Line[] = [];
    const firstChange = otherIter.peek();
    if (firstChange && firstChange.retain && !firstChange.attributes) {
      let firstLeft = firstChange.retain;
      while (thisIter.peekLineLength() <= firstLeft) {
        firstLeft -= thisIter.peekLineLength();
        lines.push(thisIter.nextLine());
      }
      if (firstChange.retain - firstLeft > 0) {
        otherIter.next(firstChange.retain - firstLeft);
      }
    }

    if (!thisIter.hasNext()) {
      if (throwOnError)
        throw new Error(
          'apply() called with change that extends beyond document',
        );
    }
    let line = lineUtils.createFrom(thisIter.peekLine());
    // let wentBeyond = false;

    function addLine(line: Line) {
      line.length = line.content.length() + 1;
      lines.push(line);
    }

    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (otherIter.peekType() === 'insert') {
        const otherOp = otherIter.peek();
        const index =
          typeof otherOp.insert === 'string'
            ? otherOp.insert.indexOf('\n', otherIter.offset)
            : -1;
        if (index < 0) {
          line.content.push(otherIter.next());
        } else {
          const nextIndex = index - otherIter.offset;
          if (nextIndex) line.content.push(otherIter.next(nextIndex));
          const newlineOp = otherIter.next(1);
          // Ensure that the content up until now retains the current line id
          addLine(
            lineUtils.create(line.content, newlineOp.attributes, line.id),
          );
          // Reset the content and ID of the new line
          line = lineUtils.create(undefined, line.attributes);
        }
      } else {
        const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
        const thisOp = thisIter.next(length);
        const otherOp = otherIter.next(length);
        if (typeof thisOp.retain === 'number') {
          if (throwOnError)
            throw new Error(
              'apply() called with change that extends beyond document',
            );
          // line.content.push({ insert: '#'.repeat(otherOp.retain || 1) });
          // wentBeyond = true;
          continue;
        }

        if (typeof otherOp.retain === 'number') {
          const isLine = thisOp.insert === '\n';
          let newOp: Op = thisOp;
          // Preserve null when composing with a retain, otherwise remove it for inserts
          const attributes =
            otherOp.attributes &&
            AttributeMap.compose(thisOp.attributes, otherOp.attributes);
          if (otherOp.attributes && !isEqual(attributes, thisOp.attributes)) {
            if (isLine) {
              line.attributes = attributes || {};
            } else {
              newOp = { insert: thisOp.insert };
              if (attributes) newOp.attributes = attributes;
            }
          }
          if (isLine) {
            addLine(line);
            line = lineUtils.createFrom(thisIter.peekLine());
          } else {
            line.content.push(newOp);
          }

          // Optimization if at the end of other
          if (otherOp.retain === Infinity || !otherIter.hasNext()) {
            if (
              thisIter.opIterator.index !== 0 ||
              thisIter.opIterator.offset !== 0
            ) {
              const ops = thisIter.restCurrentLine();
              for (let i = 0; i < ops.length; i++) {
                line.content.push(ops[i]);
              }
              addLine(line);
              thisIter.nextLine();
            }
            lines.push(...thisIter.restLines());
            break;
          }
        } else if (typeof otherOp.delete === 'number') {
          if (thisOp.insert === '\n') {
            // Be sure a deleted line is not kept
            line = lineUtils.create(
              line.content,
              thisIter.peekLine()?.attributes,
              line.id,
            );
          }
          // else ... otherOp should be a delete so we won't add the next thisOp insert
        }
      }
    }

    // if (wentBeyond) {
    //   console.log('went beyond:', line);
    //   addLine(line);
    // }

    // Deleted the last newline without replacing it
    if (!lines.length) {
      lines.push(line);
    }

    return new TextDocument(lines, selection);
  }

  replace(delta?: Delta, selection?: EditorRange | null) {
    return new TextDocument(delta, selection);
  }

  toDelta(): Delta {
    const cache = DELTA_CACHE;
    let delta = cache.get(this);
    if (!delta) {
      delta = lineUtils.toDelta(this.lines);
      cache.set(this, delta);
    }
    return delta;
  }

  equals(other: TextDocument, options?: { contentOnly?: boolean }) {
    return (
      this === other ||
      ((options?.contentOnly || isEqual(this.selection, other.selection)) &&
        isEqual(this.lines, other.lines, { excludeProps }))
    );
  }

  toJSON() {
    return this.toDelta();
  }

  toString() {
    return (
      this.lines
        .map((line) =>
          line.content
            .map((op) => (typeof op.insert === 'string' ? op.insert : ' '))
            .join(''),
        )
        .join('\n') + '\n'
    );
  }
}

// eslint-disable-next-line max-params
function getAttributes(
  Type: any,
  data: any,
  from: number,
  to: number,
  filter?: (next: any) => boolean,
  options?: FormattingOptions,
): AttributeMapType {
  const iter = Type.iterator(data);
  let attributes: AttributeMapType | undefined;
  let index = 0;
  if (iter.skip) index += iter.skip(from);
  while (index < to && iter.hasNext()) {
    const next = iter.next() as { attributes: AttributeMapType };
    index += Type.length(next);
    if (index > from && (!filter || filter(next))) {
      if (!next.attributes) attributes = {};
      else if (!attributes) attributes = { ...next.attributes };
      else if (options?.allFormats)
        attributes = AttributeMap.compose(attributes, next.attributes);
      else
        attributes = intersectAttributes(
          attributes,
          next.attributes,
          options?.nameOnly,
        );
    }
  }
  return attributes || EMPTY_OBJ;
}

/**
 * Intersect 2 attribute maps, keeping only those that are equal in both
 */
function intersectAttributes(
  attributes: AttributeMapType,
  other: AttributeMapType,
  nameOnly?: boolean,
) {
  return Object.keys(other).reduce(function (intersect, name) {
    if (nameOnly) {
      if (name in attributes && name in other) intersect[name] = true;
    } else if (isEqual(attributes[name], other[name], { partial: true })) {
      intersect[name] = other[name];
    } else if (isEqual(other[name], attributes[name], { partial: true })) {
      intersect[name] = attributes[name];
    }
    return intersect;
  }, {});
}
