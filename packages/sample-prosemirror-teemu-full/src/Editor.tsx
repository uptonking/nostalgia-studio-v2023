import { EditorView } from 'prosemirror-view';
import React, { useMemo } from 'react';

import { ReactEditorView } from './ReactEditorView';
import {
  AnalyticsProvider,
  EditorContext,
  EditorViewProvider,
  PluginsProvider,
} from './core';
import { AnalyticsProps } from './core/AnalyticsProvider';
import { PortalProvider, PortalRenderer } from './react/portals';
import { EditorAppearance } from './types/editor-ui';
import { FullPage } from './ui/FullPage';

export interface EditorProps {
  disabled?: boolean;
  shouldTrack?: boolean;
  analytics?: AnalyticsProps;
  appearance?: EditorAppearance;
  collab?: {
    documentId: string;
  };
  onEditorReady?: (viewProvider: EditorViewProvider) => void;
  onDocumentEdit?: (editorView: EditorView) => void;
}

const components = {
  'full-page': FullPage,
};

/** 主题提供编辑器所需要的默认contextVal */
export function Editor(props: EditorProps) {
  const { appearance = 'full-page', analytics } = props;
  // These three have to be inside useMemos for SSR compatibility
  const viewProvider = useMemo(() => new EditorViewProvider(), []);
  const portalProvider = useMemo(() => new PortalProvider(), []);
  const pluginsProvider = useMemo(() => new PluginsProvider(), []);
  const analyticsProvider = useMemo(
    () => new AnalyticsProvider(analytics),
    [analytics],
  );

  const editorCtxVal = useMemo(
    () => ({
      viewProvider,
      portalProvider,
      pluginsProvider,
      analyticsProvider,
    }),
    [analyticsProvider, pluginsProvider, portalProvider, viewProvider],
  );

  const EditorLayoutComp = useMemo(() => components[appearance], [appearance]);

  return (
    <EditorContext.Provider value={editorCtxVal}>
      <ReactEditorView
        editorProps={props}
        EditorLayoutComponent={EditorLayoutComp}
      />
      <PortalRenderer />
    </EditorContext.Provider>
  );
}

Editor.displayName = 'FullEditor';
