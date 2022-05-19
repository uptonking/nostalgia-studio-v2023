import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Descendant,
  Editor,
  Range,
  Text,
  Transforms,
  createEditor,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  DefaultEditable as Editable,
  Slate,
  useFocused,
  useSlate,
  withReact,
} from 'slate-react';

import { Button, Icon, Menu, Portal } from '../components';

/**
 * 💡️ 选中文本时出现的悬浮工具条示例，一般包含文本格式化按钮，也可包含其他操作按钮。
 * - 弹框容器一直渲染，通过left大偏移使得默认不可见
 * - 弹框可见条件是 window.getSelection().getRangeAt(0) 位置，并以此决定弹框位置
 */
export const InlineToolbarApp = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const handleBeforeInput = useCallback(
    (event: InputEvent) => {
      event.preventDefault();
      switch (event.inputType) {
        case 'formatBold':
          return toggleFormat(editor, 'bold');
        case 'formatItalic':
          return toggleFormat(editor, 'italic');
        case 'formatUnderline':
          return toggleFormat(editor, 'underlined');
      }
    },
    [editor],
  );

  return (
    <Slate editor={editor} value={initialValue as any}>
      <HoveringToolbar />
      <Editable
        renderLeaf={(props) => <Leaf {...props} />}
        placeholder='Enter some text...'
        onDOMBeforeInput={handleBeforeInput}
      />
    </Slate>
  );
};

const toggleFormat = (editor, format) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true },
  );
};

const isFormatActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: 'all',
  });
  return !!match;
};

/** slate文本元素 */
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underlined) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

/**
 * - 悬浮工具条通过createPortal渲染到body，dom一直是渲染的，页面不可见因为 position: absolute; left: -10000px;。
 * - 悬浮工具条的位置根据 window.getSelection().getRangeAt(0) 确定。
 */
const HoveringToolbar = () => {
  const containerRef = useRef<HTMLDivElement | null>();
  const editor = useSlate();
  const inFocus = useFocused();

  useEffect(() => {
    const el = containerRef.current;
    const { selection } = editor;

    if (!el) return;

    if (
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      // 弹框默认样式是class设置的，style设置的是位置样式，去掉style属性会恢复默认位置，变为页面不可见
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  });

  return (
    <Portal>
      <Menu
        // menu的样式写在styles.css
        ref={containerRef}
        onMouseDown={(e) => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault();
        }}
      >
        <FormatButton format='bold' icon='format_bold' />
        <FormatButton format='italic' icon='format_italic' />
        <FormatButton format='underlined' icon='format_underlined' />
      </Menu>
    </Portal>
  );
};

const FormatButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      reversed
      active={isFormatActive(editor, format)}
      onClick={() => toggleFormat(editor, format)}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows how you can make a hovering menu appear above your content, which you can use to make text ',
      },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', or anything else you might want to do!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Try it out yourself! Just ' },
      { text: 'select any piece of text and the menu will appear', bold: true },
      { text: '.' },
    ],
  },
];

export default InlineToolbarApp;
