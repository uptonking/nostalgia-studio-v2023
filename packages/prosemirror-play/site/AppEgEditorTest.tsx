import 'prosemirror-view/style/prosemirror.css';

import './index.css';

import * as React from 'react';

import {
  APIProvider,
  Base,
  BlockQuote,
  Editor,
  EditorContext,
  PortalRenderer,
  ReactEditorContext,
  createDefaultProviders,
} from '../src/index';

export function AppEgEditorTest() {
  return (
    <div
      style={{ margin: `1rem`, padding: `1rem`, border: `1px solid silver` }}
    >
      <Editor>
        <Base />
        <BlockQuote />
      </Editor>
      <PortalRenderer />
    </div>
  );
}

export default AppEgEditorTest;
