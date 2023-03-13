export {
  getRemoteCaretsOnLeaf,
  getRemoteCursorsOnLeaf,
  type RemoteCaretDecoratedRange,
  type RemoteCaretDecoration,
  type RemoteCursorDecoratedRange,
  type RemoteCursorDecoration,
  type TextWithRemoteCursors,
  useDecorateRemoteCursors,
  type UseDecorateRemoteCursorsOptions,
} from './hooks/useDecorateRemoteCursors';

export {
  useRemoteCursorStates,
  useRemoteCursorStatesSelector,
} from './hooks/useRemoteCursorStates';

export { useUnsetCursorPositionOnBlur } from './hooks/useUnsetCursorPositionOnBlur';

export { getCursorRange } from './utils/getCursorRange';

export {
  type CursorOverlayData,
  useRemoteCursorOverlayPositions,
  type UseRemoteCursorOverlayPositionsOptions,
} from './hooks/useRemoteCursorOverlayPositions';
