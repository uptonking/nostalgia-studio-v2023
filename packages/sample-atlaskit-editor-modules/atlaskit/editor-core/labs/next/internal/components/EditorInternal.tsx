import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import { WidthProvider } from '../../../../../editor-common';
import { useProviderFactory } from '../../../../../editor-common/provider-factory';
import EditorActions from '../../../../actions';
import EditorContext from '../../../../ui/EditorContext';
import { EditorSharedConfigProvider } from '../context/shared-config';
import { EditorPropsExtended } from '../editor-props-type';
import { useEditor } from '../hooks/use-editor';
import { EditorContentProvider } from './EditorContent';

export function EditorInternal(
  {
    onAnalyticsEvent,
    disabled,
    transformer,
    defaultValue,
    plugins,
    portalProviderAPI,
    popupsMountPoint,
    popupsBoundariesElement,
    popupsScrollableElement,
    onChange,
    onDestroy,
    onMount,
    children,
  }: EditorPropsExtended,
  context: any,
) {
  // Need to memoize editor actions otherwise in case when editor is not
  // wrapped with EditorContext every prop change triggers all hooks
  // that depend on editorActions
  const maybeEditorActions = (context || {}).editorActions;
  const editorActions = React.useMemo(
    () => maybeEditorActions || new EditorActions(),
    [maybeEditorActions],
  );

  // Get the provider factory from context
  const providerFactory = useProviderFactory();
  const [editorSharedConfig, mountEditor] = useEditor({
    context,
    editorActions,
    onAnalyticsEvent,

    disabled,

    transformer,
    defaultValue,

    plugins,

    portalProviderAPI,
    popupsMountPoint,
    popupsBoundariesElement,
    popupsScrollableElement,

    onChange,
    onDestroy,
    onMount,

    providerFactory,
    featureFlags: {},
  });

  return (
    <WidthProvider>
      <EditorContext editorActions={editorActions}>
        <EditorSharedConfigProvider value={editorSharedConfig}>
          <EditorContentProvider value={mountEditor}>
            {children}
          </EditorContentProvider>
        </EditorSharedConfigProvider>
      </EditorContext>
    </WidthProvider>
  );
}

EditorInternal.contextTypes = {
  editorActions: PropTypes.object,
  intl: intlShape,
};
