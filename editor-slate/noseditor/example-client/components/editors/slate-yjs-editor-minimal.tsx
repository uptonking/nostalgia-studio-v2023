import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import {
  createEditor,
  type Descendant,
  Editor,
  type Node as SlateNode,
  Transforms,
} from 'slate';
import { DefaultEditable as Editable, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';

import {
  slateNodesToInsertDelta,
  withYHistory,
  withYjs,
  YjsEditor,
} from '@slate-yjs/core';

const initialValue = [
  {
    type: 'p',
    children: [
      { text: 'Hello, test paragraph. 测试yjs管理数据，暂未实现协同。' },
    ],
  },
] as unknown as SlateNode[];

export const SlateYjsEditorMinimal = () => {
  // Create a yjs document and get the shared type
  const sharedType = useMemo(() => {
    const yDoc = new Y.Doc();
    const shared = yDoc.get('content', Y.XmlText);
    // Load the initial value into the yjs document
    shared.applyDelta(slateNodesToInsertDelta(initialValue));
    return shared;
  }, []);

  // Setup the binding
  const editor = useMemo(() => {
    // const sharedType = provider.document.get('content', Y.XmlText);

    const edit = withReact(
      withYHistory(
        withYjs(createEditor(), sharedType, { shouldObserveYEvent: true }),
      ),
    );

    // Ensure editor always has at least 1 valid child
    const { normalizeNode } = edit;
    edit.normalizeNode = (entry) => {
      const [node] = entry;
      if (!Editor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry);
      }

      Transforms.insertNodes(
        editor,
        {
          type: 'p',
          children: [{ text: '' }],
        },
        { at: [0] },
      );
    };
    return edit;
  }, [sharedType]);
  window['ed'] = editor;
  window['ydoc'] = sharedType;

  // const [value, setValue] = useState([]);

  // Connect editor in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <Slate editor={editor} value={[]}>
      {/* <Slate editor={editor} value={value} onChange={setValue}> */}
      <Editable />
    </Slate>
  );
};
