import React, { useCallback, useReducer, useState } from 'react';

import { createEditor, Descendant, Editor } from 'slate';
import { DefaultEditable as Editable, ReactEditor, Slate } from 'slate-react';

import { NosIconProvider } from '../../components';
import {
  useEditor,
  usePlugins,
  usePluginsHandlers,
  useRenderElement,
  useRenderLeaf,
} from '../../hooks';
import { usePersistedState } from '../../hooks/utils';
import { DndFeatureProvider } from '../../plugins';
import type { CustomEditor } from '../../types/slate';
import { DragOverlayContent } from './draggable-element';
import { EditorToolbar } from './editor-toolbar';

export type NosEditorProps = {
  initialValue?: Descendant[];
  id?: string;
  readOnly?: boolean;
};

/**
 * A ready-to-use rich text editor built with slate.
 *
 * It can be used as an reference implementation to build your own block editor.
 */
export const NosEditor = (props: NosEditorProps) => {
  const { initialValue, id = 'main', readOnly = false } = props;

  const forceRerender = useReducer(() => ({}), {})[1];

  const plugins = usePlugins();
  const editor = useEditor(createEditor, plugins) as CustomEditor;
  window['ed'] = editor;

  const handlers = usePluginsHandlers(editor, [
    ...plugins,
    {
      handlers: {
        onKeyDown: () => () => {
          // after dnd ends then ReactEditor.focus call, to continue typing
          forceRerender();
        },
        onClick: () => () => {
          if (editor.selection?.anchor) {
            const pathClone = [...editor.selection.anchor.path];
            pathClone.pop(); // get rid of trailing text node postion in path.
            const anchorNode = pathClone.reduce((node, pathPosition) => {
              if (!node) return editor.children[pathPosition];
              return node.children[pathPosition];
            }, null);
            console.log(
              ';; ed-sel-start ',
              editor.selection?.anchor,
              anchorNode,
              // ExtendedEditor.semanticNode(anchorNode),
            );
          }
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
        <DndFeatureProvider
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
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            {...handlers}
          />
        </DndFeatureProvider>
      </Slate>
    </NosIconProvider>
  );
};
