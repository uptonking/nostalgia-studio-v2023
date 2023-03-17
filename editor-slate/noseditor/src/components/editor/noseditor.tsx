import React, { useReducer, useState } from 'react';

import { createEditor, Descendant, Editor } from 'slate';
import { DefaultEditable as Editable, ReactEditor, Slate } from 'slate-react';
import {
  IS_FIREFOX_LEGACY,
  IS_IOS,
  IS_QQBROWSER,
  IS_SAFARI,
  IS_UC_MOBILE,
  IS_WECHATBROWSER,
} from 'slate-react/src/utils/environment';

import { NosIconProvider } from '../../config/icon-provider';
import { usePersistedState } from '../../hooks/use-persisted-state';
import {
  DragOverlayContent,
} from '../../plugins/wrapper/components/drag-overlay-content';
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
          // forceRerender();
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
            onDragEnd={() => {
              // after dnd ends to provide the right DragOverlay drop animation
              forceRerender();
            }}
            editor={editor}
            renderDragOverlay={(props) => <DragOverlayContent {...props} />}
          >
            <EditorToolbar />
            <Editable
              className='nos-editable'
              {...handlers}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onCompositionEnd={(
                event: React.CompositionEvent<HTMLDivElement>,
              ) => {
                if (ReactEditor.isComposing(editor)) {
                  // COMPAT: In Chrome, `beforeinput` events for compositions
                  // aren't correct and never fire the "insertFromComposition"
                  // type that we need. So instead, insert whenever a composition
                  // ends since it will already have been committed to the DOM.
                  if (
                    !IS_SAFARI &&
                    !IS_FIREFOX_LEGACY &&
                    !IS_IOS &&
                    !IS_QQBROWSER &&
                    !IS_WECHATBROWSER &&
                    !IS_UC_MOBILE &&
                    event.data
                  ) {
                    // /chrome comes here
                    Editor.insertText(editor, event.data);
                    // 🚨 hack for update slateValue earlier to avoid
                    event.data = null;
                  }
                }
              }}
            />
          </DndPluginContext>
        </SlateExtended>
      </Slate>
    </NosIconProvider>
  );
};
