import { Plugin } from 'prosemirror-state';

import { AnalyticsStep, AnalyticsWithChannel } from '../../../adf-schema/steps';
import {
  isPerformanceAPIAvailable,
  measureRender,
} from '../../../editor-common';
import { EditorPlugin } from '../../types/editor-plugin';
import { PerformanceTracking } from '../../types/performance-tracking';
import { getFeatureFlags } from '../feature-flags-context';
import { generateUndoRedoInputSoucePayload } from '../undo-redo/undo-redo-input-source';
import { fireAnalyticsEvent } from './fire-analytics-event';
import { analyticsPluginKey } from './plugin-key';
import { ACTION, AnalyticsEventPayload, EVENT_TYPE } from './types';
import { getAnalyticsEventsFromTransaction } from './utils';

// import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';

interface AnalyticsPluginOptions {
  createAnalyticsEvent?: any;
  performanceTracking?: PerformanceTracking;
}

function createPlugin(options: AnalyticsPluginOptions) {
  if (!options || !options.createAnalyticsEvent) {
    return;
  }

  const hasRequiredPerformanceAPIs = isPerformanceAPIAvailable();

  return new Plugin({
    key: analyticsPluginKey,
    state: {
      init: () => options,
      apply: (tr, pluginState, _, state) => {
        if (getFeatureFlags(state)?.catchAllTracking) {
          const analyticsEventWithChannel =
            getAnalyticsEventsFromTransaction(tr);
          if (analyticsEventWithChannel.length > 0) {
            for (const { payload, channel } of analyticsEventWithChannel) {
              // Measures how much time it takes to update the DOM after each ProseMirror document update
              // that has an analytics event.
              if (
                hasRequiredPerformanceAPIs &&
                tr.docChanged &&
                payload.action !== ACTION.INSERTED &&
                payload.action !== ACTION.DELETED
              ) {
                const measureName = `${payload.actionSubject}:${payload.action}:${payload.actionSubjectId}`;
                measureRender(measureName, (duration) => {
                  fireAnalyticsEvent(pluginState.createAnalyticsEvent)({
                    payload: extendPayload(payload, duration),
                    channel,
                  });
                });
              }
            }
          }
        }
        return pluginState;
      },
    },
  });
}

const analyticsPlugin = (options: AnalyticsPluginOptions): EditorPlugin => ({
  name: 'analytics',

  pmPlugins() {
    return [
      {
        name: 'analyticsPlugin',
        plugin: () => createPlugin(options),
      },
    ];
  },

  onEditorViewStateUpdated({
    originalTransaction,
    transactions,
    newEditorState,
  }) {
    const pluginState = analyticsPluginKey.getState(newEditorState);

    if (!pluginState || !pluginState.createAnalyticsEvent) {
      return;
    }

    const steps = transactions.reduce<AnalyticsWithChannel<any>[]>(
      (acc, tr) => {
        const payloads: AnalyticsWithChannel<any>[] = tr.steps
          .filter(
            (step): step is AnalyticsStep<any> => step instanceof AnalyticsStep,
          )
          .map((x) => x.analyticsEvents)
          .reduce((acc, val) => acc.concat(val), []);

        acc.push(...payloads);

        return acc;
      },
      [],
    );

    if (steps.length === 0) {
      return;
    }

    const { createAnalyticsEvent } = pluginState;
    const undoAnaltyicsEventTransformer =
      generateUndoRedoInputSoucePayload(originalTransaction);
    steps.forEach(({ payload, channel }) => {
      const nextPayload = undoAnaltyicsEventTransformer(payload);

      fireAnalyticsEvent(createAnalyticsEvent)({
        payload: nextPayload,
        channel,
      });
    });
  },
});

export function extendPayload(
  payload: AnalyticsEventPayload,
  duration: number,
) {
  return {
    ...payload,
    attributes: {
      ...payload.attributes,
      duration,
    },
    eventType: EVENT_TYPE.OPERATIONAL,
  } as AnalyticsEventPayload;
}

export default analyticsPlugin;
