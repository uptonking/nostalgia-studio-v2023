import React, { useCallback, useReducer, useState } from 'react';

import { createEditor, Descendant, Editor } from 'slate';
import { DefaultEditable as Editable, ReactEditor, Slate } from 'slate-react';

import { NosIconProvider } from '../../config/icon-provider';
import { usePersistedState } from '../../hooks/use-persisted-state';
import { DragOverlayContent } from '../../plugins/wrapper/components/drag-overlay-content';
import { DndPluginContext } from '../../slate-extended/dnd/dnd-plugin-context';
import { SlateExtended } from '../../slate-extended/slate-extended';
import { EditorToolbar } from '../editor-toolbar';
import {
  useEditor,
  usePlugins,
  usePluginsHandlers,
  useRenderElement,
  useRenderLeaf,
} from '../use-editor';

export type NosEditorProps = {
  id: string;
  initialValue: Descendant[];
  readOnly?: boolean;
};

/**
 * A ready-to-use rich text editor built with slate.
 *
 * It can be used as an reference implementation to build your own block editor.
 */
export const NosEditor = (props: NosEditorProps) => {
  const { id, initialValue, readOnly = false } = props;

  const forceRerender = useReducer(() => ({}), {})[1];

  const plugins = usePlugins();
  const editor = useEditor(createEditor, plugins);
  window['ed'] = editor;

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

  const [value, setValue] = usePersistedState<Descendant[]>(
    `${id}_content`,
    (restored) => (readOnly ? initialValue : restored ?? initialValue),
  );

  return (
    <NosIconProvider>
      <Slate editor={editor} value={value} onChange={setValue}>
        <SlateExtended>
          <DndPluginContext
            editor={editor}
            onDragEnd={useCallback(() => {
              // after dnd ends to provide the right DragOverlay drop animation
              forceRerender();
            }, [forceRerender])}
            renderDragOverlay={useCallback(
              (props) => (
                <DragOverlayContent {...props} />
              ),
              [],
            )}
          >
            <EditorToolbar />
            <Editable
              className='nos-editable'
              {...handlers}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
            />
          </DndPluginContext>
        </SlateExtended>
      </Slate>
    </NosIconProvider>
  );
};
