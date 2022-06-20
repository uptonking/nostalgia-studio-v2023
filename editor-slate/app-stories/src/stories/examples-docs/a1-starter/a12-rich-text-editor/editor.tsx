import isHotkey from 'is-hotkey';
import React, { useCallback, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, useSlate, withReact } from 'slate-react';

import { RichElement } from './editor-element';
import { RichLeaf } from './editor-leaf';
import { RichToolbar } from './toolbar';
import { HOTKEYS, toggleMark } from './utils';

/**
 * ✨️ slate官方富文本编辑器示例
 * - https://www.slatejs.org/examples/richtext
 * - 工具条上提供了行内文本操作和块级文本操作
 */
export const SlateRichTextEditor = () => {
  const renderElement = useCallback((props) => <RichElement {...props} />, []);

  const renderLeaf = useCallback((props) => <RichLeaf {...props} />, []);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate editor={editor} value={initialValue}>
      <RichToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder='Enter some rich text…'
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
] as unknown as Descendant[];

export default SlateRichTextEditor;
