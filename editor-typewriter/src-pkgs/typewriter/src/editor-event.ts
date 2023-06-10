import {
  type AttributeMapType,
  type Delta,
  type Line,
  type TextChange,
  type TextDocument,
} from '@typewriter/document';

import { type SourceString } from './Source';

export const EMPTY_ARR = [];

export interface EditorFormatEventInit extends EventInit {
  formats: AttributeMapType;
}

export class EditorFormatEvent extends Event {
  formats: AttributeMapType;

  constructor(type: string, init: EditorFormatEventInit) {
    super(type, init);
    this.formats = init.formats;
  }
}

export function getChangedLines(oldDoc: TextDocument, newDoc: TextDocument) {
  const set = new Set(oldDoc.lines);
  return newDoc.lines.filter((line) => !set.has(line));
}

export interface EditorChangeEventInit extends EventInit {
  old: TextDocument;
  doc: TextDocument;
  change?: TextChange;
  changedLines?: Line[];
  source: SourceString;
}

/** DOM event style */
export class EditorChangeEvent extends Event {
  old: TextDocument;
  doc: TextDocument;
  change?: TextChange;
  changedLines?: Line[];
  source: SourceString;

  constructor(type: string, init: EditorChangeEventInit) {
    super(type, init);
    this.old = init.old;
    this.doc = init.doc;
    this.change = init.change;
    this.changedLines = init.changedLines;
    this.source = init.source;
    // Fix Safari bug, see https://stackoverflow.com/a/58471803
    Object.setPrototypeOf(this, EditorChangeEvent.prototype);
  }

  /** Modify the data during a "changing" event before doc is committed */
  modify(delta: Delta) {
    if (!this.cancelable)
      throw new Error(
        'Cannot modify an applied change, listen to the "changing" event',
      );
    this.doc = this.doc.apply(delta);
    if (this.change) this.change.delta = this.change.delta.compose(delta);
    if (this.changedLines) {
      this.changedLines =
        this.old.lines === this.doc.lines
          ? EMPTY_ARR
          : getChangedLines(this.old, this.doc);
    }
  }
}
