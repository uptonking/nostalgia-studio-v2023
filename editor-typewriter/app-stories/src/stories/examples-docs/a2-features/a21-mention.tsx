import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Descendant, Editor, Range, Transforms, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  DefaultEditable as Editable,
  ReactEditor,
  Slate,
  useFocused,
  useSelected,
  withReact,
} from 'slate-react';

import { Portal } from '../components';
import { type MentionElement } from '../types';
import { MENTION_CHARACTERS } from '../utils';

/** mention plugin */
const withMention = (editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === 'mention' ? true : isInline(element);
  };
  editor.isVoid = (element) => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  return editor;
};

/** mention command */
const insertMention = (editor, character) => {
  const mention: MentionElement = {
    type: 'mention',
    character,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

/** 支持自定义元素的slate element */
const Element = (props) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'mention':
      return <Mention {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

/**
 * ✨️ mention示例。
 * - 下拉列表小弹框出现的实现：渲染到portal，条件是输入range存在且搜索结果非空
 * - 👀️ 注意此示例at弹框的出现条件与notion不同，此示例需要at后输入字符，而notion在at后立即弹框
 * - 小弹框位置通过range计算得到DOMRect，然后修改style.left/top
 * - 插入inline且void的slate element到编辑器
 * - Slate顶层onChange事件触发频率极高，onKeyDown如果只是鼠标selection则不会触发，都需要条件执行
 * - 🐛️ 缺点，当光标在浏览器窗口底端时，at下拉菜单弹框会被挡住而不可见
 */
export const MentionApp = () => {
  const portalContainerRef = useRef<HTMLDivElement | null>();
  // @后输入的所有字符对应的编辑器range，注意选中状态在下拉框时上下移动光标range不变
  const [targetRange, setTargetRange] = useState<Range | undefined>();
  // @后输入的字符，可以是多个字符
  const [searchChars, setSearchChars] = useState('');
  // mention下拉列表中选中的索引号
  const [selectedIndex, setSelectedIndex] = useState(0);

  const editor = useMemo(
    () => withMention(withReact(withHistory(createEditor()))),
    [],
  );

  const renderElement = useCallback((props) => <Element {...props} />, []);

  /** 根据用户输入的at后的字符而搜索到的结果 */
  const searchResults = MENTION_CHARACTERS.filter((c) =>
    c.toLowerCase().startsWith(searchChars.toLowerCase()),
  ).slice(0, 10);

  /** keydown时执行operation/transform，更新编辑器数据 */
  const onKeyDown = useCallback(
    (event) => {
      if (targetRange) {
        console.log(';; onKeyDown ', event);
        switch (event.key) {
          case 'ArrowDown': {
            event.preventDefault();
            const prevIndex =
              selectedIndex >= searchResults.length - 1 ? 0 : selectedIndex + 1;
            setSelectedIndex(prevIndex);
            break;
          }
          case 'ArrowUp': {
            event.preventDefault();
            const nextIndex =
              selectedIndex <= 0 ? searchResults.length - 1 : selectedIndex - 1;
            setSelectedIndex(nextIndex);
            break;
          }
          case 'Tab':
          case 'Enter':
            event.preventDefault();
            Transforms.select(editor, targetRange);
            // 👉 在enter键处理插入inline元素
            insertMention(editor, searchResults[selectedIndex]);
            setTargetRange(null);
            break;
          case 'Escape':
            event.preventDefault();
            setTargetRange(null);
            break;
        }
      }
    },
    [searchResults, editor, selectedIndex, targetRange],
  );

  /** onChange时更新react-state */
  const handleEditorChange = useCallback(() => {
    const { selection } = editor;

    console.log(
      ';; onEditorChange-isSelectionChange',
      editor.operations.every((op) => op.type === 'set_selection'),
      editor,
      selection,
      selection?.anchor?.offset,
      selection?.focus?.offset,
    );

    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);

      const wordBefore = Editor.before(editor, start, { unit: 'word' });
      const before = wordBefore && Editor.before(editor, wordBefore);
      const beforeRange = before && Editor.range(editor, before, start);
      const beforeText = beforeRange && Editor.string(editor, beforeRange);
      const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);

      const after = Editor.after(editor, start);
      const afterRange = Editor.range(editor, start, after);
      const afterText = Editor.string(editor, afterRange);
      const afterMatch = afterText.match(/^(\s|$)/);

      if (beforeMatch && afterMatch) {
        // 若光标前面文本以@开头且后面是空格
        setTargetRange(beforeRange);
        setSearchChars(beforeMatch[1]);
        setSelectedIndex(0);
        return;
      }
    }

    setTargetRange(null);
  }, [editor]);

  useEffect(() => {
    if (targetRange && searchResults.length > 0) {
      // 每次@后文字长度变化，或搜索结果变化，就从range中计算DOMRect，更新小弹框位置
      const el = portalContainerRef.current;
      const domRange = ReactEditor.toDOMRange(editor, targetRange);
      const rect = domRange.getBoundingClientRect();
      // 找到range位置后，下拉框要出现在该行下面，所以➕️24，否则下拉框会挡住当前行
      // el.style.top = `${rect.top + window.pageYOffset}px`;
      el.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [searchResults.length, editor, selectedIndex, searchChars, targetRange]);

  return (
    <Slate editor={editor} value={initialValue} onChange={handleEditorChange}>
      <Editable
        renderElement={renderElement}
        onKeyDown={onKeyDown}
        placeholder='Enter some text...'
      />
      {targetRange && searchResults.length > 0 && (
        <Portal>
          <div
            ref={portalContainerRef}
            style={{
              position: 'absolute',
              top: '-9999px',
              left: '-9999px',
              zIndex: 1,
              padding: '3px',
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,.2)',
            }}
            data-cy='mentions-portal'
          >
            {searchResults.map((char, i) => (
              <div
                key={char}
                style={{
                  padding: '1px 3px',
                  borderRadius: '3px',
                  background: i === selectedIndex ? '#B4D5FF' : 'transparent',
                }}
              >
                {char}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </Slate>
  );
};

const Mention = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <span
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.character.replace(' ', '-')}`}
      style={{
        padding: '3px 3px 2px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        borderRadius: '4px',
        backgroundColor: '#eee',
        fontSize: '0.9em',
        boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
      }}
    >
      @{element.character}
      {children}
    </span>
  );
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows how you might implement a simple @-mentions feature that lets users autocomplete mentioning a user by their username. Which, in this case means Star Wars characters. The mentions are rendered as void inline elements inside the document.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Try mentioning characters, like ' },
      {
        type: 'mention',
        character: 'R2-D2',
        children: [{ text: '' }],
      },
      { text: ' or ' },
      {
        type: 'mention',
        character: 'Mace Windu',
        children: [{ text: '' }],
      },
      { text: '!' },
    ],
  },
];
