import { Editor, Element, Location, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import type { LinkElementType } from './types';
import { createLinkElement, isLinkElement, LinkSpec } from './utils';

export const removeLink = (editor: Editor, linkElement?: LinkElementType) => {
  let path;
  if (linkElement) {
    path = ReactEditor.findPath(editor, linkElement);
  }
  Transforms.unwrapNodes(editor, {
    at: path,
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === LinkSpec,
  });
};

export const updateLink = (
  editor: Editor,
  linkElement: LinkElementType,
  url: string,
) => {
  if (!url) return;

  const path = ReactEditor.findPath(editor, linkElement);

  Transforms.setNodes(
    editor,
    {
      url,
    },
    { at: path },
  );
};

export const insertLink = (editor: Editor, url: string) => {
  if (!url) return;

  const { selection } = editor;
  const linkElem = createLinkElement({ url, text: url });

  if (selection) {
    const [parent, parentPath] = Editor.parent(editor, selection.focus.path);
    if (parent['type'] === LinkSpec) {
      removeLink(editor);
    }

    // todo if inert image link
    if (editor.isVoid(parent as Element)) {
      Transforms.insertNodes(
        editor,
        { type: 'p', children: [linkElem] },
        {
          at: Path.next(parentPath),
          select: true,
        },
      );
    } else if (Range.isCollapsed(selection)) {
      Transforms.insertNodes(editor, linkElem, { select: true });
    } else {
      Transforms.wrapNodes(editor, linkElem, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  } else {
    // /if no selection, insert a paragraph to the end of editor
    Transforms.insertNodes(editor, { type: 'p', children: [linkElem] });
  }
};
