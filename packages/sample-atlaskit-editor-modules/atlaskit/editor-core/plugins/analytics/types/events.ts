import type { UnsupportedContentPayload } from '../../../../editor-common';
import type { Dispatch } from '../../../event-dispatcher';
import type { SimplifiedNode } from '../../../utils/document-logger';
import type { AvatarEventPayload } from './avatar';
import type { ConfigPanelEventPayload } from './config-panel-events';
import type { CutCopyEventPayload } from './cut-copy-events';
import type { DateEventPayload } from './date-events';
import type { ElementBrowserEventPayload } from './element-browser-events';
import type {
  ACTION,
  ACTION_SUBJECT,
  ACTION_SUBJECT_ID,
  CONTENT_COMPONENT,
  FLOATING_CONTROLS_TITLE,
} from './enums';
import type { ExperimentalEventPayload } from './experimental-events';
import type { ExtensionEventPayload } from './extension-events';
import type { FindReplaceEventPayload } from './find-replace-events';
import type { FormatEventPayload } from './format-events';
import type { GeneralEventPayload } from './general-events';
import type { InsertEventPayload } from './insert-events';
import type { CreateLinkInlineDialogEventPayload } from './link-tool-bar-events';
import type { ListEventPayload } from './list-events';
import type { MediaEventPayload } from './media-events';
import type { NodeEventPayload } from './node-events';
import type { PasteEventPayload } from './paste-events';
import type { SelectionEventPayload } from './selection-events';
import type { SubstituteEventPayload } from './substitute-events';
import type { TableEventPayload } from './table-events';
import type { OperationalAEP } from './utils';

export type AnalyticsEventPayload =
  | AvatarEventPayload
  | GeneralEventPayload
  | FormatEventPayload
  | SubstituteEventPayload
  | InsertEventPayload
  | NodeEventPayload
  | MediaEventPayload
  | TableEventPayload
  | PasteEventPayload
  | CutCopyEventPayload
  | ErrorEventPayload
  | ExperimentalEventPayload // Used for A/B testing
  | FindReplaceEventPayload
  | DateEventPayload
  | SelectionEventPayload
  | ListEventPayload
  | ConfigPanelEventPayload
  | ElementBrowserEventPayload
  | CreateLinkInlineDialogEventPayload
  | UnsupportedContentPayload
  | ExtensionEventPayload
  | TransactionEventPayload;

export type AnalyticsEventPayloadWithChannel = {
  channel: string;
  payload: AnalyticsEventPayload;
};

export type AnalyticsDispatch = Dispatch<{
  payload: AnalyticsEventPayload;
  channel?: string;
}>;

// Error events need to be in this file as they reference AnalyticsEventPayloadWithChannel
// and so there would be a circular dependency if they were in their own file

type InvalidTransactionErrorAEP = OperationalAEP<
  ACTION.DISPATCHED_INVALID_TRANSACTION,
  ACTION_SUBJECT.EDITOR,
  undefined,
  {
    analyticsEventPayloads: AnalyticsEventPayloadWithChannel[];
    invalidNodes: (SimplifiedNode | string)[];
  },
  undefined
>;

type DispatchedValidTransactionAEP = OperationalAEP<
  ACTION.DISPATCHED_VALID_TRANSACTION,
  ACTION_SUBJECT.EDITOR,
  undefined,
  undefined,
  undefined
>;

type InvalidTransactionStepErrorAEP = OperationalAEP<
  ACTION.DISCARDED_INVALID_STEPS_FROM_TRANSACTION,
  ACTION_SUBJECT.EDITOR,
  undefined,
  {
    analyticsEventPayloads: AnalyticsEventPayloadWithChannel[];
  },
  undefined
>;

export type TransactionEventPayload = DispatchedValidTransactionAEP;

type FailedToUnmountErrorAEP = OperationalAEP<
  ACTION.FAILED_TO_UNMOUNT,
  ACTION_SUBJECT.EDITOR,
  ACTION_SUBJECT_ID.REACT_NODE_VIEW,
  {
    error: Error;
    domNodes: {
      container?: string;
      child?: string;
    };
  },
  undefined
>;

type SynchronyErrorAEP = OperationalAEP<
  ACTION.SYNCHRONY_ERROR,
  ACTION_SUBJECT.EDITOR,
  undefined,
  {
    error: Error;
    docStructure?: string | SimplifiedNode;
  },
  undefined
>;

type SynchronyEntityErrorAEP = OperationalAEP<
  ACTION.SYNCHRONY_ENTITY_ERROR | ACTION.SYNCHRONY_DISCONNECTED,
  ACTION_SUBJECT.EDITOR,
  undefined,
  {
    onLine: boolean;
    visibilityState: string;
  },
  undefined
>;

type ContentComponentErrorAEP = OperationalAEP<
  ACTION.ERRORED,
  ACTION_SUBJECT.CONTENT_COMPONENT,
  undefined,
  {
    component: CONTENT_COMPONENT;
    error: string;
    errorStack?: string;
    selection: { [key: string]: string };
    position: number;
    docSize: number;
  },
  undefined
>;

type ComponentCrashErrorAEP = OperationalAEP<
  ACTION.EDITOR_CRASHED,
  | ACTION_SUBJECT.FLOATING_CONTEXTUAL_BUTTON
  | ACTION_SUBJECT.PLUGIN_SLOT
  | ACTION_SUBJECT.REACT_NODE_VIEW
  | ACTION_SUBJECT.TABLES_PLUGIN
  | ACTION_SUBJECT.FLOATING_TOOLBAR_PLUGIN
  | ACTION_SUBJECT.EDITOR,
  ACTION_SUBJECT_ID | FLOATING_CONTROLS_TITLE,
  {
    error: Error;
    errorInfo: React.ErrorInfo;
    product?: string;
    browserInfo?: string;
    errorId?: string;
    docStructure?: string | SimplifiedNode;
  },
  undefined
>;

export type ErrorEventPayload =
  | InvalidTransactionErrorAEP
  | InvalidTransactionStepErrorAEP
  | FailedToUnmountErrorAEP
  | SynchronyErrorAEP
  | SynchronyEntityErrorAEP
  | ContentComponentErrorAEP
  | ComponentCrashErrorAEP;
