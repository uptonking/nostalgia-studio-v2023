import {
  type Ancestor,
  Editor,
  type EditorAboveOptions,
  type Location,
  type Node,
  Path,
  Point,
  Range,
} from 'slate';

import { type AutoformatRule, type MatchRange } from './types';

type GetMatchRangeOptions = {
  match: string | MatchRange;
  trigger?: AutoformatRule['trigger'];
};

export const getMatchRange = ({ match, trigger }: GetMatchRangeOptions) => {
  let start: string;
  let end: string;

  if (typeof match === 'object') {
    start = match.start;
    end = match.end;
  } else {
    start = match;
    end = start.split('').reverse().join('');
  }

  const triggers: string[] = trigger
    ? Array.isArray(trigger)
      ? trigger
      : [trigger]
    : [end.slice(-1)];

  end = trigger ? end : end.slice(0, -1);

  return {
    start,
    end,
    triggers,
  };
};

/**
 * Get the range from the start of the block above a location (default: selection) to the location.
 */
export const getRangeFromBlockStart = (
  editor: Editor,
  options: Omit<EditorAboveOptions<Ancestor>, 'match'> = {},
): Range | undefined => {
  const path = getBlockAbove(editor, options)?.[1];
  if (!path) return undefined;

  const start = Editor.start(editor, path);

  const focus = getPointFromLocation(editor, options);

  if (!focus) return undefined;

  return { anchor: start, focus };
};

/**
 * Get the block above a location (default: selection).
 */
export const getBlockAbove = <T extends Ancestor = Ancestor>(
  editor: Editor,
  options: EditorAboveOptions<T> = {},
) => {
  return Editor.above<T>(editor, {
    ...options,
    match: (node, path) => Editor.isBlock(editor, node),
  });
};

/**
 * Get the point from a location (default: selection).
 * - If the location is a range, get the anchor point.
 * - If the location is a path, get the point at this path with offset 0.
 * - If `focus` is true, get the focus point.
 */
export const getPointFromLocation = (
  editor: Editor,
  {
    at = editor.selection,
    focus,
  }: {
    at?: Location | null;
    focus?: boolean;
  } = {},
) => {
  let point: Point | undefined;
  if (Range.isRange(at)) point = !focus ? at.anchor : at.focus;
  if (Point.isPoint(at)) point = at;
  if (Path.isPath(at)) point = { path: at, offset: 0 };

  return point;
};

/**
 * See {@link Editor.string}.
 * If `at` is not defined, return an empty string.
 */
export const getText = (editor: Editor, at?: Location | null) =>
  (at && Editor.string(editor, at)) ?? '';
