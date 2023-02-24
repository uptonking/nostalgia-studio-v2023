import { Editor, NodeEntry, Path, Transforms } from 'slate';

import { createContent } from './creator';

export const withTable = (editor: Editor) => {
  const { addMark, removeMark, deleteBackward, deleteFragment } = editor;

  editor.addMark = (key, value) => {
    if (editor.selection) {
      const lastSelection = editor.selection;

      const selectedCells = Editor.nodes(editor, {
        // @ts-expect-error fix-types
        match: (n) => n.selectedCell,
        at: [],
      });

      let isTable = false;

      for (let cell of selectedCells) {
        if (!isTable) {
          isTable = true;
        }

        const [content] = Editor.nodes(editor, {
          // @ts-expect-error fix-types
          match: (n) => n.type === 'table-content',
          at: cell[1],
        });

        if (Editor.string(editor, content[1]) !== '') {
          Transforms.setSelection(editor, Editor.range(editor, cell[1]));
          addMark(key, value);
        }
      }

      if (isTable) {
        Transforms.select(editor, lastSelection);
        return;
      }
    }

    addMark(key, value);
  };

  editor.removeMark = (key) => {
    if (editor.selection) {
      const lastSelection = editor.selection;
      const selectedCells = Editor.nodes(editor, {
        match: (n) => {
          // @ts-expect-error fix-types
          return n.selectedCell;
        },
        at: [],
      });

      let isTable = false;
      for (let cell of selectedCells) {
        if (!isTable) {
          isTable = true;
        }

        const [content] = Editor.nodes(editor, {
          // @ts-expect-error fix-types
          match: (n) => n.type === 'table-content',
          at: cell[1],
        });

        if (Editor.string(editor, content[1]) !== '') {
          Transforms.setSelection(editor, Editor.range(editor, cell[1]));
          removeMark(key);
        }
      }

      if (isTable) {
        Transforms.select(editor, lastSelection);
        return;
      }
    }
    removeMark(key);
  };

  editor.deleteFragment = (...args) => {
    if (editor.selection && isInSameTable(editor)) {
      const selectedCells = Editor.nodes(editor, {
        match: (n) => {
          // @ts-expect-error fix-types
          return n.selectedCell;
        },
      });

      for (let cell of selectedCells) {
        Transforms.setSelection(editor, Editor.range(editor, cell[1]));

        const [content] = Editor.nodes(editor, {
          // @ts-expect-error fix-types
          match: (n) => n.type === 'table-content',
        });

        // @ts-expect-error fix-types
        Transforms.insertNodes(editor, createContent(), { at: content[1] });
        Transforms.removeNodes(editor, { at: Path.next(content[1]) });
      }

      return;
    }

    Transforms.removeNodes(editor, {
      // @ts-expect-error fix-types
      match: (n) => n.type === 'table',
    });

    deleteFragment(...args);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    // @ts-expect-error fix-types
    if (selection && Range.isCollapsed(selection)) {
      const isInTable = Editor.above(editor, {
        // @ts-expect-error fix-types
        match: (n) => n.type === 'table',
      });

      if (isInTable) {
        const start = Editor.start(editor, selection);
        const isStart = Editor.isStart(editor, start, selection);

        const currCell = Editor.above(editor, {
          // @ts-expect-error fix-types
          match: (n) => n.type === 'table-cell',
        });

        if (isStart && currCell && !Editor.string(editor, currCell[1])) {
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};

export function checkTableIsExist(editor: Editor, table: NodeEntry) {
  const cells = Array.from(
    Editor.nodes(editor, {
      at: table[1],
      // @ts-expect-error fix-types
      match: (n) => n.type === 'table-cell',
    }),
  );

  return !!cells.length;
}

export function isTableElement(type: string) {
  return (
    type === 'table' ||
    type === 'table-row' ||
    type === 'table-cell' ||
    type === 'table-content'
  );
}

export function isInSameTable(editor: Editor): boolean {
  if (!editor.selection) return false;

  const [start, end] = Editor.edges(editor, editor.selection);
  const [startTable] = Editor.nodes(editor, {
    at: start,
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table',
  });

  const [endTable] = Editor.nodes(editor, {
    at: end,
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table',
  });

  if (startTable && endTable) {
    const [, startPath]: [any, Path] = startTable;
    const [, endPath]: [any, Path] = endTable;

    if (Path.equals(startPath, endPath)) {
      return true;
    }
  }

  return false;
}
