import React, { useCallback, useMemo } from 'react';

import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Point,
  Range,
} from 'slate';
import { withHistory } from 'slate-history';
import { DefaultEditable as Editable, Slate, withReact } from 'slate-react';

const withTables = (editor) => {
  const { deleteBackward, deleteForward, insertBreak } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'table-cell',
      });

      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'table-cell',
      });

      if (cell) {
        const [, cellPath] = cell;
        const end = Editor.end(editor, cellPath);

        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }

    deleteForward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [table] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'table',
      });

      if (table) {
        return;
      }
    }

    insertBreak();
  };

  return editor;
};

/** 在model中支持了几种table-row/cell的类型 */
const CustomElement = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'table':
      return (
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case 'table-row':
      return <tr {...attributes}>{children}</tr>;
    case 'table-cell':
      return (
        <td style={{ border: '1px solid teal' }} {...attributes}>
          {children}
        </td>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const CustomLeaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  return <span {...attributes}>{children}</span>;
};

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '' }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Human', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Dog', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Cat', bold: true }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Feet', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '2' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Lives', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '9' }],
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
      },
    ],
  },
];

/**
 * ✨ simple table for slate .
 *
 * todo
 * - 上下键和左右键都是向左右移动光标
 */
export const A24TableMini = () => {
  const renderElement = useCallback(
    (props) => <CustomElement {...props} />,
    [],
  );
  const renderLeaf = useCallback((props) => <CustomLeaf {...props} />, []);
  const editor = useMemo(
    () => withTables(withHistory(withReact(createEditor()))),
    [],
  );
  return (
    <Slate editor={editor} value={initialValue}>
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  );
};
