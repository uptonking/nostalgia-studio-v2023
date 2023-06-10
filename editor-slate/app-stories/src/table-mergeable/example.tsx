import React, { useMemo, useState } from 'react';

import {
  createEditor,
  Editor,
  type NodeEntry,
  Path,
  type Point,
  Transforms,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  DefaultEditable as Editable,
  ReactEditor,
  type RenderElementProps,
  type RenderLeafProps,
  Slate,
  withReact,
} from 'slate-react';

import { initialValue } from './initialValue';
import { insertTable, Table } from './table';
import { withTable } from './table/utils';

export const renderElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'table':
    case 'table-row':
    case 'table-cell':
    case 'table-content':
      return <Table {...props} />;
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

export const renderLeaf = (props: RenderLeafProps) => (
  <span {...props.attributes}>{props.children}</span>
);

/** normalizeNode + table-utils */
export const withTableSchema = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    if (maybePreserveSpace(editor, entry)) return;

    normalizeNode(entry);
  };

  return withTable(editor);
};

export const PreserveSpaceAfter = new Set(['table']);
export const PreserveSpaceBefore = new Set(['table']);

export const insertParagraph = (
  editor: Editor,
  at: Path | Point,
  text = '',
) => {
  Transforms.insertNodes(
    editor,
    {
      type: 'paragraph',
      children: [{ text }],
    },
    {
      at,
    },
  );
};

const maybePreserveSpace = (
  editor: Editor,
  entry: NodeEntry,
): boolean | void => {
  const [node, path] = entry;
  // @ts-expect-error fix-types
  const { type } = node;
  let preserved = false;

  if (PreserveSpaceAfter.has(type)) {
    const next = Editor.next(editor, { at: path });
    // @ts-expect-error fix-types
    if (!next || PreserveSpaceBefore.has(next[0].type)) {
      insertParagraph(editor, Path.next(path));
      preserved = true;
    }
  }

  if (PreserveSpaceBefore.has(type)) {
    if (path[path.length - 1] === 0) {
      insertParagraph(editor, path);
      preserved = true;
    } else {
      const prev = Editor.previous(editor, { at: path });
      // @ts-expect-error fix-types
      if (!prev || PreserveSpaceAfter.has(prev[0].type)) {
        insertParagraph(editor, path);
        preserved = true;
      }
    }
  }

  return preserved;
};

/**
 * 🚨 demo not working
 */
export const MergeableTable = () => {
  // const [value, setValue] = useState<any[]>(initialValue);

  const editor = useMemo(
    () => withTableSchema(withHistory(withReact(createEditor()))),
    [],
  );

  return (
    <div className='editor-box'>
      <Slate
        editor={editor}
        value={initialValue}
        // onChange={setValue}
      >
        <div className='toolbar'>
          <button
            onClick={() => {
              insertTable(editor);
            }}
          >
            createTable
          </button>
        </div>
        <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
      </Slate>
    </div>
  );
};
