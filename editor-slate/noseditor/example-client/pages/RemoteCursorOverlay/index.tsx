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
  DndPluginContext,
  DragOverlayContent,
  EditorToolbar,
  NosIconProvider,
  SlateExtended,
  usePluginsHandlers,
  useRenderElement,
  useRenderLeaf,
} from '../../../src';
import {
  ConnectionToggle,
} from '../../components/ConnectionToggle/ConnectionToggle';
import { Spinner } from '../../components/Spinner/Spinner';
import { HOCUSPOCUS_ENDPOINT_URL } from '../../config';
import { useSyncableEditor } from '../../hooks/use-syncable-Editor';
import { RemoteCursorOverlay } from './Overlay';

export function EditorWithCursorOverlay(props) {
  // const { id, initialValue, readOnly = false } = props;
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

  // const editor = useMemo(() => {
  //   return withMarkdown(
  //     withEnsureOneChildren(
  //       withReact(
  //         withYHistory(
  //           withCursors(
  //             withYjs(createEditor(), sharedType, { autoConnect: false }),
  //             provider.awareness,
  //             {
  //               data: randomCursorData(),
  //             },
  //           ),
  //         ),
  //       ),
  //     ),
  //   ) as unknown as SyncableEditor;
  // }, [provider.awareness, provider.document]);

  // Connect editor and provider in useEffect to comply with concurrent mode
  // requirements.
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
        <SlateExtended>
          <DndPluginContext
            editor={editor}
            onDragEnd={() => {
              // after dnd ends to provide the right DragOverlay drop animation
              forceRerender();
            }}
            renderDragOverlay={(props) => <DragOverlayContent {...props} />}
          >
            <EditorToolbar />
            <RemoteCursorOverlay className='flex'>
              <Editable
                className='nos-editable'
                {...handlers}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
              />
            </RemoteCursorOverlay>
          </DndPluginContext>
        </SlateExtended>
        <ConnectionToggle connected={connected} onClick={toggleConnection} />
      </Slate>
    </NosIconProvider>
  );
}

// <Slate value={value} onChange={setValue} editor={editor}>
//   <RemoteCursorOverlay className='flex justify-center my-32 mx-10'>
//     <CustomEditable className='max-w-4xl w-full flex-col break-words' />
//   </RemoteCursorOverlay>
//   <ConnectionToggle connected={connected} onClick={toggleConnection} />
// </Slate>
