import React, { useState } from 'react';

import { createEditor, Descendant } from 'slate';
import { DefaultEditable as Editable, Slate } from 'slate-react';

import {
  useDragOverlayRenderElement,
} from '../../hooks/use-drag-overlay-render-element';
import { useEditor } from '../../hooks/use-editor';
import { usePlugins } from '../../hooks/use-plugins';
import { useRenderLeaf } from '../../hooks/use-render-leaf';
import { DndPluginProvider, DraggableFeatureInitializer } from '../../plugins';
import type { CustomEditor } from '../../types/slate';

type DragOverlayEditorProps = {
  initialValue: Descendant[];
};

/**
 * used in DragOverlayContent
 * @internal
 */
export const DragOverlayEditor = (props: DragOverlayEditorProps) => {
  const [value, setValue] = useState(props.initialValue);

  const plugins = usePlugins();
  const editor = useEditor(createEditor, plugins) as CustomEditor;

  const renderElement = useDragOverlayRenderElement(editor, plugins);
  const renderLeaf = useRenderLeaf(editor, plugins);

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <DraggableFeatureInitializer>
        <DndPluginProvider
          editor={editor}
          renderDragOverlay={(props) => <div />}
        >
          <Editable
            className='editable'
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            readOnly={true}
          />
        </DndPluginProvider>
      </DraggableFeatureInitializer>
    </Slate>
  );
};
