import React, { useCallback, useMemo, useState } from 'react';
import { Editor, Text, Transforms, createEditor } from 'slate';
import type { BaseEditor, Descendant } from 'slate';
import { DefaultEditable as Editable, Slate, withReact } from 'slate-react';
import type { ReactEditor } from 'slate-react';

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: '👏 Hello, Slate editor!   A line of text in a paragraph.' },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: ' ' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Live' }],
  },
];

export const SlateReactSimpleApp0 = () => {
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Slate editor={editor} value={initialValue as any}>
      <Editable />
    </Slate>
  );
};

export const SlateReactSimpleApp01Starter = () => {
  // We want editor to be stable across renders, so we use useState hook without a setter
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Slate editor={editor} value={initialValue as any}>
      <Editable />
    </Slate>
  );
};

export const SlateReactSimpleApp02EventKeyDown = () => {
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Slate editor={editor} value={initialValue as any}>
      <Editable
        onKeyDown={(event) => {
          console.log(event.key);
          if (event.key === '@') {
            // Prevent the ampersand character from being inserted.
            event.preventDefault();
            // Execute the `insertText` method when the event occurs.
            editor.insertText('at');
          }
        }}
      />
    </Slate>
  );
};

const DefaultElement = (props) => <p {...props.attributes}>{props.children}</p>;

/**
 * - Slate passes attributes that should be rendered on the top-most element of your blocks
 * - Slate will automatically render all of the children of a block for you, and then pass them to you
 * - You must render the children as the lowest leaf in your component.
 */
const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

/**
 * - 示例效果，快捷鍵 ctrl + alt + ` 可以将当前element切换为code/p，不需要selection为range
 * - 只影响光标所在的paragraph，不影响其他段落
 */
// export const SlateReactSimpleApp03CustomElement = () => {
export const SlateReactSimpleApp = () => {
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  return (
    <Slate editor={editor} value={initialValue as any}>
      <Editable
        renderElement={renderElement}
        onKeyDown={(event) => {
          console.log(event.key, event);

          if (event.key === '`' && event.ctrlKey && event.altKey) {
            // Prevent the "`" from being inserted by default.
            event.preventDefault();
            console.log(';; 插入code ');
            // Determine whether any of the currently selected blocks are code blocks.
            const [matchedCode] = Editor.nodes(editor, {
              // @ts-ignore
              match: (n) => n.type === 'code',
            });

            // Toggle the block type depending on whether there's already a match.
            Transforms.setNodes(
              editor,
              // @ts-ignore
              { type: matchedCode ? 'paragraph' : 'code' },
              { match: (n) => Editor.isBlock(editor, n) },
            );
          }
        }}
      />
    </Slate>
  );
};

/** Define a React component to render leaves with bold text. */
const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  );
};

/**
 * - 示例效果，快捷鍵 ctrl + b 可以将当前文本切换为加粗文本，再次按键不能切回去
 * - 👀 并没有通过 addMark 实现，而是通过setNodes实现，addMark本质也通过setNodes实现
 * - 只添加到文本节点，同时要split
 */
export const SlateReactSimpleApp04CustomFormatting = () => {
  // export const SlateReactSimpleApp = () => {
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <Slate editor={editor} value={initialValue as any}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          switch (event.key) {
            case '`': {
              event.preventDefault();
              const [match] = Editor.nodes(editor, {
                // @ts-ignore
                match: (n) => n.type === 'code',
              });
              Transforms.setNodes(
                editor,
                // @ts-ignore
                { type: match ? 'paragraph' : 'code' },
                { match: (n) => Editor.isBlock(editor, n) },
              );
              break;
            }

            // When "B" is pressed, bold the text in the selection.
            case 'b': {
              event.preventDefault();
              Transforms.setNodes(
                editor,
                // @ts-ignore
                { bold: true },
                // Apply it to text nodes, and split the text node up if the
                // selection is overlapping only part of it.
                { match: (n) => Text.isText(n), split: true },
              );
              break;
            }
          }
        }}
      />
    </Slate>
  );
};
