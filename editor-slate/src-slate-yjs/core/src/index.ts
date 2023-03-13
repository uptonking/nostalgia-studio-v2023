import type { RelativeRange } from './model/types';
import {
  CursorEditor,
  type CursorState,
  type CursorStateChangeEvent,
  type RemoteCursorChangeEventListener,
  withCursors,
  type WithCursorsOptions,
  withYHistory,
  type WithYHistoryOptions,
  withYjs,
  type WithYjsOptions,
  YHistoryEditor,
  YjsEditor,
} from './plugins';
import { slateNodesToInsertDelta, yTextToSlateElement } from './utils/convert';
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from './utils/position';

export {
  CursorEditor,
  CursorState,
  CursorStateChangeEvent,
  relativePositionToSlatePoint,
  RelativeRange,
  relativeRangeToSlateRange,
  type RemoteCursorChangeEventListener,
  slateNodesToInsertDelta,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
  withCursors,
  WithCursorsOptions,
  withYHistory,
  WithYHistoryOptions,
  withYjs,
  WithYjsOptions,
  YHistoryEditor,
  YjsEditor,
  yTextToSlateElement,
};
