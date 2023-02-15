import { type AttributeMapType, Delta, isEqual } from '@typewriter/delta';

import { EditorRange } from './editorRange';

export type LineIds = Map<string, Line>;
export type LineRanges = Map<Line, EditorRange>;

export const EMPTY_MAP = new Map();

/** { id, content, attributes, length } */
export interface Line {
  id: string;
  content: Delta;
  attributes: AttributeMapType;
  length: number;
}

export function linesToLineIds(lines: Line[]) {
  const lineIds = new Map();
  lines.forEach((line) => lineIds.set(line.id || createId(lineIds), line));
  return lineIds;
}

export function length(line: Line): number {
  return line.length;
}

export function getId(line: Line): string {
  console.warn('getId() is deprecated');
  return line.id;
}

export function equal(value: Line, other: Line) {
  return (
    isEqual(value.attributes, other.attributes) &&
    isEqual(value.content.ops, other.content.ops)
  );
}

/**
 * create `Line[]` from a Delta
 */
export function fromDelta(delta: Delta, existing?: LineIds): Line[] {
  const lines: Line[] = [];

  const ids = new Map(existing || []);

  delta.eachLine((content, attr) => {
    const line = create(
      content,
      Object.keys(attr).length ? attr : undefined,
      ids,
    );
    ids.set(line.id, line);
    lines.push(line);
  });

  return lines;
}

export function toDelta(lines: Line[]): Delta {
  let delta = new Delta();
  lines.forEach((line) => {
    delta = delta.concat(line.content);
    delta.insert('\n', line.attributes);
  });
  return delta;
}

/** create a Line object, create a new Delta if content is empty */
export function create(
  content: Delta = new Delta(),
  attributes: AttributeMapType = {},
  id?: string | LineIds,
): Line {
  // use 1 because empty blocks are always filled with a `<br>` element to keep them open, otherwise they collapse and the user can't click into them to enter any text.
  // ❓ why +1
  const length = content.length() + 1;
  if (typeof id !== 'string') id = createId(id);
  return { id, attributes, content, length };
}

export function createFrom(
  line?: Line,
  content = new Delta(),
  lineIds?: LineIds,
): Line {
  const id = line ? line.id : createId(lineIds);
  const attributes = line ? line.attributes : {};
  return { id, attributes, content, length: 1 };
}

export function getLineRanges(lines: Line[]) {
  const ranges = new Map<Line, EditorRange>() as LineRanges;
  let pos = 0;
  lines.forEach((line) => {
    ranges.set(line, [pos, (pos += line.length)]);
  });
  return ranges;
}

/**
 * todo better id
 */
export function createId(existing: LineIds = EMPTY_MAP) {
  let id: string;
  while (existing[(id = Math.random().toString(36).slice(2))]);
  return id;
}
