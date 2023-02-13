import { AttributeMap, Delta, isEqual } from '@typewriter/delta';

import { EditorRange } from './editorRange';

export type LineIds = Map<string, Line>;
export type LineRanges = Map<Line, EditorRange>;

export const EMPTY_MAP = new Map();

export interface Line {
  id: string;
  attributes: AttributeMap;
  content: Delta;
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

export function fromDelta(delta: Delta, existing?: LineIds) {
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

export function create(
  content: Delta = new Delta(),
  attributes: AttributeMap = {},
  id?: string | LineIds,
): Line {
  const length = content.length() + 1;
  if (typeof id !== 'string') id = createId(id);
  return { id, attributes, content: content, length };
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

export function createId(existing: LineIds = EMPTY_MAP) {
  let id: string;
  while (existing[(id = Math.random().toString(36).slice(2))]);
  return id;
}
