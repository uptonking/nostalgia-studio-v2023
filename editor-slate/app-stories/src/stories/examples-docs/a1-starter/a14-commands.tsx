import React, { useCallback, useMemo, useState } from 'react';
import { Editor, Text, Transforms, createEditor } from 'slate';
import { type BaseEditor, type Descendant } from 'slate';
import { DefaultEditable as Editable, Slate, withReact } from 'slate-react';
import { type ReactEditor } from 'slate-react';

const saveContent = (content: string, key: string = 'editorContent') => {
  localStorage.setItem(key, content);
};

const loadContent = (key: string = 'editorContent') => {
  return localStorage.getItem(key);
};

/** - Define our own custom set of helpers.
 * - implement these domain-specific concepts by creating custom helper functions
 * - you can invoke commands from anywhere we have access to `editor` object.
 */
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      // @ts-ignore
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      // @ts-ignore
      match: (n) => n.type === 'code',
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      // @ts-ignore
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true },
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      // @ts-ignore
      { type: isActive ? null : 'code' },
      { match: (n) => Editor.isBlock(editor, n) },
    );
  },
};

const initialValue = JSON.parse(loadContent()) || [
  {
    type: 'paragraph',
    children: [
      { text: '👏 Hello, Slate editor!   A line of text in a paragraph.' },
    ],
  },
];

const DefaultElement = (props) => <p {...props.attributes}>{props.children}</p>;

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

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

export const SlateCommandsApp = () => {
  const editor = useMemo(() => withReact(createEditor()), []);

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
    <Slate
      editor={editor}
      value={initialValue as any}
      onChange={(value) => {
        const isAstChange = editor.operations.some(
          (op) => 'set_selection' !== op.type,
        );
        if (isAstChange) {
          saveContent(JSON.stringify(value));
        }
      }}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          // Replace the `onKeyDown` logic with our new commands.
          switch (event.key) {
            case '`': {
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
              break;
            }

            case 'b': {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;
            }
          }
        }}
      />
    </Slate>
  );
};
