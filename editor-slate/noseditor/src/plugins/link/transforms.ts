import { Editor, Element, Path, Range, Transforms } from 'slate';

import { createLinkElement, isLinkElement, LinkSpec } from '../link/utils';

export const removeLink = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === LinkSpec,
  });
};

export const unwrapLinks = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: isLinkElement,
  });
};

export const insertLink = (editor: Editor, url: string) => {
  if (!url) return;

  const { selection } = editor;
  const linkElem = createLinkElement({ url, text: url });

  // Transforms.insertNodes(editor, linkElem);
  // // move selection offset to continue editing text instead a link
  // Transforms.move(editor, { unit: 'offset' });

  if (selection) {
    const [parent, parentPath] = Editor.parent(editor, selection.focus.path);
    if (parent['type'] === LinkSpec) {
      removeLink(editor);
    }

    //for image nodes, will be implemented later
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
    }
  } else {
    Transforms.insertNodes(editor, { type: 'p', children: [linkElem] });
  }
};
