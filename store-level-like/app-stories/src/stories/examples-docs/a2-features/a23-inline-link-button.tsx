import { isKeyHotkey } from 'is-hotkey';
import isUrl from 'is-url';
import React, { useMemo } from 'react';
import {
  type BaseEditor,
  Descendant,
  Editor,
  Range,
  Element as SlateElement,
  Transforms,
  createEditor,
} from 'slate';
import { type HistoryEditor, withHistory } from 'slate-history';
import {
  DefaultEditable as Editable,
  type ReactEditor,
  Slate,
  useFocused,
  useSelected,
  useSlate,
  withReact,
} from 'slate-react';

import { css } from '@emotion/css';

import { Button, Icon, Toolbar } from '../components';
import { type ButtonElement, type LinkElement } from '../types/custom-types';

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;
type CustomText = { text: string; bold?: true };
type CustomElement = { type: 'paragraph'; children: CustomText[] };

const EditorElement = (props) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'link':
      // 👀 注意link element的children包含text，所以LinkComponent的内层children包含 CustomText
      return <LinkComponent {...props} />;
    case 'button':
      return <EditableButtonComponent {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const EditorLeaf = (props) => {
  const { attributes, children, leaf } = props;
  return (
    <span
      // The following is a workaround for a Chromium bug where,
      // if you have an inline at the end of a block,
      // clicking the end of a block puts the cursor inside the inline
      // instead of inside the final {text: ''} node
      // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
      className={
        leaf.text === ''
          ? css`
              padding-left: 0.1px;
            `
          : null
      }
      {...attributes}
    >
      {children}
    </span>
  );
};

/**
 * ✨️ 行内链接和按钮示例。
 * - 只能添加和删除link，不能修改link。
 * - 粘贴的url会自动渲染成link。
 */
export const InlineLinkButtonApp = () => {
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    [],
  );

  /** 👀 只处理键盘左右方向键的事件，特殊处理进入退出inline元素的逻辑 */
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    const { selection } = editor;

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    // unit为offset(按左键)时，光标会在link边缘停一下，再按左才进入link文字内部；
    // unit为character时，光标会直接进入link文字内部
    if (selection && Range.isCollapsed(selection)) {
      const { nativeEvent } = event;
      if (isKeyHotkey('left', nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: 'offset', reverse: true });
        // Transforms.move(editor, { unit: 'character', reverse: true });
        return;
      }
      if (isKeyHotkey('right', nativeEvent)) {
        event.preventDefault();
        // Transforms.move(editor, { unit: 'offset' });
        Transforms.move(editor, { unit: 'character' });
        return;
      }
    }
  };

  return (
    <Slate editor={editor} value={initialValue}>
      <Toolbar>
        <AddLinkButton />
        <RemoveLinkButton />
        <ToggleEditableButtonButton />
      </Toolbar>
      <Editable
        renderElement={(props) => <EditorElement {...props} />}
        renderLeaf={(props) => <EditorLeaf {...props} />}
        placeholder='Enter some text...'
        onKeyDown={onKeyDown}
      />
    </Slate>
  );
};

/** 自定义inline元素的插件，返回增强后的editor对象 */
const withInlines = (editor: CustomEditor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) =>
    ['link', 'button'].includes(element['type']) || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      toggleLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      toggleLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n['type'] === 'link',
  });
  return Boolean(link);
};

const isButtonActive = (editor) => {
  const [button] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n['type'] === 'button',
  });
  return Boolean(button);
};

const insertLink = (editor, url) => {
  if (editor.selection) {
    toggleLink(editor, url);
  }
};

const insertButton = (editor) => {
  if (editor.selection) {
    wrapButton(editor);
  }
};

const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n['type'] === 'link',
  });
};

/** 👉 若是link，则取消link；若不是link，则将选区内元素转换为link */
const toggleLink = (editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const unwrapButton = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n['type'] === 'button',
  });
};

const wrapButton = (editor) => {
  if (isButtonActive(editor)) {
    unwrapButton(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const button: ButtonElement = {
    type: 'button',
    children: isCollapsed ? [{ text: 'Edit me!' }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, button);
  } else {
    Transforms.wrapNodes(editor, button, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
//  Cannot place selection at start of inline node
const InlineChromiumBugfix = () => (
  <span
    contentEditable={false}
    className={css`
      font-size: 0;
    `}
  >
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const LinkComponent = ({ attributes, children, element }) => {
  // const selected = useSelected();
  const selected = true;
  return (
    <a
      {...attributes}
      href={element.url}
      className={
        // 👀 link组件只在光标处于选中或闪烁状态时才会显示背景色
        selected
          ? css`
              box-shadow: 0 0 0 3px #ddd;
              background-color: #eee;
              padding: 4px 8px;
              font-size: 20px;
            `
          : ''
      }
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};

const EditableButtonComponent = ({ attributes, children }) => {
  return (
    /*
      Note that this is not a true button, but a span with button-like CSS.
      True buttons are display:inline-block, but Chrome and Safari
      have a bad bug with display:inline-block inside contenteditable:
      - https://bugs.webkit.org/show_bug.cgi?id=105898
      - https://bugs.chromium.org/p/chromium/issues/detail?id=1088403
      Worse, one cannot override the display property: https://github.com/w3c/csswg-drafts/issues/3226
      The only current workaround is to emulate the appearance of a display:inline button using CSS.
    */
    <span
      {...attributes}
      onClick={(ev) => ev.preventDefault()}
      // Margin is necessary to clearly show the cursor adjacent to the button
      className={css`
        margin: 0 0.1em;

        background-color: #efefef;
        padding: 2px 6px;
        border: 1px solid #767676;
        border-radius: 2px;
        font-size: 0.9em;
      `}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </span>
  );
};

/** 工具条按钮 */
const AddLinkButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        console.log(';; enter-link ', url);
        insertLink(editor, url);
      }}
    >
      <Icon>link_add</Icon>
    </Button>
  );
};

/** 工具条按钮 */
const RemoveLinkButton = () => {
  const editor = useSlate();

  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event) => {
        if (isLinkActive(editor)) {
          unwrapLink(editor);
        }
      }}
    >
      <Icon>link_off</Icon>
    </Button>
  );
};

/** 工具条按钮 */
const ToggleEditableButtonButton = () => {
  const editor = useSlate();
  return (
    <Button
      active
      onMouseDown={(event) => {
        event.preventDefault();
        if (isButtonActive(editor)) {
          unwrapButton(editor);
        } else {
          insertButton(editor);
        }
      }}
    >
      <Icon>button_add</Icon>
    </Button>
  );
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to block nodes, you can create inline nodes. Here is a ',
      },
      {
        type: 'link',
        url: 'https://en.wikipedia.org/wiki/Hypertext',
        children: [{ text: 'hyperlink' }],
      },
      {
        text: ', and here is',
      },
      {
        type: 'link',
        url: 'https://en.wikipedia.org/wiki/Hypertext',
        children: [{ text: 'AB' }],
      },
      {
        text: 'C, and here is a more unusual inline: an ',
      },
      {
        type: 'button',
        children: [{ text: 'editable button' }],
      },
      {
        text: '!',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'There are two ways to add links. You can either add a link via the toolbar icon above, or if you want in on a little secret, copy a URL to your keyboard and paste it while a range of text is selected. ',
      },
      // The following is an example of an inline at the end of a block.
      // This is an edge case that can cause issues.
      {
        type: 'link',
        url: 'https://twitter.com/JustMissEmma/status/1448679899531726852',
        children: [{ text: 'Finally, here is our favorite dog video.' }],
      },
      { text: '' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'unit为offset(按左键)时，光标会在link边缘停一下，再按左就进入link文字内部； ',
      },
      { text: '' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'unit为character时，光标会直接进入link文字内部',
      },
      { text: '' },
    ],
  },
];
