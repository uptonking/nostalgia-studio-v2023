import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { type Descendant } from 'slate';
import { DefaultEditable as Editable, Slate } from 'slate-react';

import { HocuspocusProvider } from '@hocuspocus/provider';
import { YjsEditor } from '@slate-yjs/core';

import {
  DndPluginProvider,
  DragOverlayContent,
  EditorToolbar,
  NosIconProvider,
  usePluginsHandlers,
  useRenderElement,
  useRenderLeaf,
} from '../../../src';
import { ErrorBoundary } from '../../components/common/error-boundary';
import {
  ConnectionToggle,
} from '../../components/ConnectionToggle/ConnectionToggle';
import { Spinner } from '../../components/Spinner/Spinner';
import { HOCUSPOCUS_ENDPOINT_URL } from '../../config';
import { useSyncableEditor } from '../../hooks/use-syncable-Editor';
import { RemoteCursorOverlay } from './overlay';

export function EditorWithCursorOverlay() {
  const forceRerender = useReducer(() => ({}), {})[1];

  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: HOCUSPOCUS_ENDPOINT_URL,
        name: 'slate-yjs-demo',
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
        connect: false,
      }),
    [],
  );

  const toggleConnection = useCallback(() => {
    if (connected) {
      return provider.disconnect();
    }
    provider.connect();
  }, [provider, connected]);

  const { editor, plugins } = useSyncableEditor({ provider });
  window['ed'] = editor;

  // Connect editor and provider in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    provider.connect();
    return () => provider.disconnect();
  }, [provider]);
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  const handlers = usePluginsHandlers(editor, [
    ...plugins,
    {
      handlers: {
        onKeyDown: () => () => {
          // after dnd ends then ReactEditor.focus call, to continue typing
          forceRerender();
        },
      },
    },
  ]);

  const renderElement = useRenderElement(editor, plugins);
  const renderLeaf = useRenderLeaf(editor, plugins);

  if ('sharedRoot' in editor && editor.sharedRoot['length'] === 0) {
    return <Spinner className='m-auto' />;
  }

  return (
    <NosIconProvider>
      <Slate editor={editor} value={value} onChange={setValue}>
        {/* <SlateExtended> */}
        <DndPluginProvider
          editor={editor}
          onDragEnd={() => {
            // after dnd ends to provide the right DragOverlay drop animation
            forceRerender();
          }}
          renderDragOverlay={(props) => <DragOverlayContent {...props} />}
        >
          <EditorToolbar />
          <ErrorBoundary fallback={<h3>cursor is not rendering properly.</h3>}>
            <RemoteCursorOverlay className='flex'>
              <Editable
                className='nos-editable'
                {...handlers}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
              />
            </RemoteCursorOverlay>
          </ErrorBoundary>
        </DndPluginProvider>
        {/* </SlateExtended> */}
        <ConnectionToggle connected={connected} onClick={toggleConnection} />
      </Slate>
    </NosIconProvider>
  );
}
