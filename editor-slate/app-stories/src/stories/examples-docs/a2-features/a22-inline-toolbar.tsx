import './styles.css';

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
 * ✨️ 选中文本时出现的悬浮工具条示例，一般包含文本格式化按钮，也可包含其他操作按钮。
 * - 弹框容器一直渲染，通过left大偏移使得默认不可见
 * - 弹框可见条件是 window.getSelection().getRangeAt(0) 位置，并以此决定弹框位置
 * - 🐛️ 原示例存在默认回车无法换行的问题，在handleBeforeInput已解决
 * - 🐛️ 原示例当光标在浏览器窗口顶端时，弹出的悬浮工具条会被挡住而不可见
 */
export const InlineToolbarApp = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  /**
   * - 支持快捷键 ctrl+b
   * - [What is the purpose of onDOMBeforeInput?](https://github.com/ianstormtaylor/slate/issues/3302)
   * - It's an event handler for the native DOM `beforeinput` event, because sadly React's synthetic events don't properly expose it.
   * - In this case it's listening for specific inputTypes that browsers fire for context menus, etc.
   * - Preventing the default before entering the switch statement for the onDomBeforeInput will disable the ability to type into the editor. In order to actually be able to enter text, you have to preventDefault behaviour only for the format cases.
   */
  const handleBeforeInput = useCallback(
    (event: InputEvent) => {
      console.log(';; event.inputType ', event.inputType, event);

      switch (event.inputType) {
        case 'formatBold':
          event.preventDefault();
          return toggleFormat(editor, 'bold');
        case 'formatItalic':
          event.preventDefault();
          return toggleFormat(editor, 'italic');
        case 'formatUnderline':
          event.preventDefault();
          return toggleFormat(editor, 'underlined');
      }
    },
    [editor],
  );

  useEffect(() => {
    if (editor) window['se'] = editor;
  }, [editor]);

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
  console.log(';; toggle format ', format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true },
  );
};

/** todo 判断选中区域文本是否都为某种状态，目前只要选中范围包含加粗的文本，按钮就会高亮，不合预期 */
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
        ref={containerRef}
        onMouseDown={(e) => {
          // 若注释掉，则点击工具条button后，工具条会消失，prevent toolbar from taking focus away from editor
          e.preventDefault();
        }}
        className='slate-inline-menu'
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
