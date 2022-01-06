import type { EditorView } from 'prosemirror-view';
import React from 'react';

import type { ProviderFactory } from '../../editor-common/provider-factory';
import EditorActions from '../actions';
import type { EventDispatcher } from '../event-dispatcher';
import type { DispatchAnalyticsEvent } from '../plugins/analytics/types/dispatch-analytics-event';
import type { EditorAppearance } from './editor-appearance';

export type UiComponentFactoryParams = {
  editorView: EditorView;
  editorActions: EditorActions;
  eventDispatcher: EventDispatcher;
  dispatchAnalyticsEvent?: DispatchAnalyticsEvent;
  providerFactory: ProviderFactory;
  appearance: EditorAppearance;
  popupsMountPoint?: HTMLElement;
  popupsBoundariesElement?: HTMLElement;
  popupsScrollableElement?: HTMLElement;
  containerElement: HTMLElement | null;
  disabled: boolean;
};

export type UIComponentFactory = (
  params: UiComponentFactoryParams,
) => React.ReactElement<any> | null;
