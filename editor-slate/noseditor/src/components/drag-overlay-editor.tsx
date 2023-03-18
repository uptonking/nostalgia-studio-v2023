import React, { useState } from 'react';

import { createEditor, Descendant } from 'slate';
import { DefaultEditable as Editable, Slate } from 'slate-react';

import { DndPluginContext } from '../slate-extended/dnd/dnd-plugin-context';
import { SlateExtended } from '../slate-extended/slate-extended';
import { useDragOverlayRenderElement } from './use-editor/use-drag-overlay-render-element';
import { useEditor } from './use-editor/use-editor';
import { usePlugins } from './use-editor/use-plugins';
import { useRenderLeaf } from './use-editor/use-render-leaf';

type DragOverlayEditorProps = {
  initialValue: Descendant[];
};

/**
 *
 */
export const DragOverlayEditor = (props: DragOverlayEditorProps) => {
  const [value, setValue] = useState(props.initialValue);

  const plugins = usePlugins();
  const editor = useEditor(createEditor, plugins);

  const renderElement = useDragOverlayRenderElement(editor, plugins);
  const renderLeaf = useRenderLeaf(editor, plugins);

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <SlateExtended>
        <DndPluginContext
          editor={editor}
          renderDragOverlay={(props) => <div />}
        >
          <Editable
            className='editable'
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            readOnly={true}
          />
        </DndPluginContext>
      </SlateExtended>
    </Slate>
  );
};
