import { EditorState, Plugin, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import type { AnalyticsEventPayload } from '../../../plugins/analytics';
import type { PMPluginFactoryParams } from '../../../types';
import type { DispatchAnalyticsEvent } from '../../analytics/types/dispatch-analytics-event';
import {
  ACTION,
  ACTION_SUBJECT,
  ACTION_SUBJECT_ID,
  EVENT_TYPE,
} from '../../analytics/types/enums';
import {
  SelectCellAEP,
  SelectNodeAEP,
  SelectRangeAEP,
} from '../../analytics/types/selection-events';
import {
  getAllSelectionAnalyticsPayload,
  getCellSelectionAnalyticsPayload,
  getNodeSelectionAnalyticsPayload,
  getRangeSelectionAnalyticsPayload,
} from '../../selection/utils';
import { clipboardPluginKey } from '../plugin-key';

export const createPlugin = ({
  dispatchAnalyticsEvent,
}: PMPluginFactoryParams) =>
  new Plugin({
    key: clipboardPluginKey,
    props: {
      handleDOMEvents: {
        cut: (view) =>
          sendClipboardAnalytics(view, dispatchAnalyticsEvent, ACTION.CUT),
        copy: (view) =>
          sendClipboardAnalytics(view, dispatchAnalyticsEvent, ACTION.COPIED),
      },
    },
  });

export const sendClipboardAnalytics = (
  view: EditorView,
  dispatchAnalyticsEvent: DispatchAnalyticsEvent,
  action: ACTION.CUT | ACTION.COPIED,
) => {
  const clipboardAnalyticsPayload = getAnalyticsPayload(view.state, action);
  if (clipboardAnalyticsPayload) {
    dispatchAnalyticsEvent(clipboardAnalyticsPayload);
  }
  // return false so we don't block any other plugins' cut or copy handlers
  // from running just because we are sending an analytics event
  return false;
};

const getAnalyticsPayload = (
  state: EditorState,
  action: ACTION.CUT | ACTION.COPIED,
): AnalyticsEventPayload | undefined => {
  const { selection, doc } = state;
  const selectionAnalyticsPayload =
    getNodeSelectionAnalyticsPayload(selection) ||
    getRangeSelectionAnalyticsPayload(selection, doc) ||
    getAllSelectionAnalyticsPayload(selection) ||
    getCellSelectionAnalyticsPayload(state);

  if (selectionAnalyticsPayload) {
    const { actionSubjectId: selectionActionSubjectId } =
      selectionAnalyticsPayload;

    const content: string[] = [];
    switch (selectionActionSubjectId) {
      case ACTION_SUBJECT_ID.NODE:
        content.push(
          (selectionAnalyticsPayload as SelectNodeAEP).attributes!.node,
        );
        break;
      case ACTION_SUBJECT_ID.RANGE:
        content.push(
          ...(selectionAnalyticsPayload as SelectRangeAEP).attributes!.nodes,
        );
        break;
      case ACTION_SUBJECT_ID.ALL:
        content.push('all');
        break;
      case ACTION_SUBJECT_ID.CELL: {
        const { selectedCells } = (selectionAnalyticsPayload as SelectCellAEP)
          .attributes!;
        content.push(...Array(selectedCells).fill('tableCell'));
        break;
      }
    }

    return {
      eventType: EVENT_TYPE.TRACK,
      action,
      actionSubject: ACTION_SUBJECT.DOCUMENT,
      attributes: {
        content,
      },
    };
  }

  if (selection instanceof TextSelection && selection.$cursor) {
    return {
      eventType: EVENT_TYPE.TRACK,
      action,
      actionSubject: ACTION_SUBJECT.DOCUMENT,
      attributes: {
        content: ['caret'],
      },
    };
  }
};
