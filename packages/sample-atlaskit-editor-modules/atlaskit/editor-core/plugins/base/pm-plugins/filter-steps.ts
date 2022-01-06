import { Plugin, Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';

import {
  ACTION,
  ACTION_SUBJECT,
  DispatchAnalyticsEvent,
  EVENT_TYPE,
  getAnalyticsEventsFromTransaction,
} from '../../analytics';

const hasInvalidSteps = (tr: Transaction) =>
  ((tr.steps || []) as (Step & { from: number; to: number })[]).some(
    (step) => step.from > step.to,
  );

/** 设置 filterTransaction */
export default (dispatchAnalyticsEvent: DispatchAnalyticsEvent) => {
  return new Plugin({
    filterTransaction(transaction) {
      if (hasInvalidSteps(transaction)) {
        console.warn(
          'The transaction was blocked because it contains invalid steps',
          transaction.steps,
        );

        // dispatchAnalyticsEvent({
        //   action: ACTION.DISCARDED_INVALID_STEPS_FROM_TRANSACTION,
        //   actionSubject: ACTION_SUBJECT.EDITOR,
        //   attributes: {
        //     analyticsEventPayloads:
        //       getAnalyticsEventsFromTransaction(transaction),
        //   },
        //   eventType: EVENT_TYPE.OPERATIONAL,
        // });

        // return false就会取消对state执行tr
        return false;
      }

      return true;
    },
  });
};
