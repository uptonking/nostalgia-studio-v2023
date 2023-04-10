import { Editor, Element, Text, Transforms } from 'slate';

import { TextAlignValues, type TextAlignValueType } from '../utils';

export const isMarkActive = (
  editor: Editor,
  format: keyof Omit<Text, 'text'>,
) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (
  editor: Editor,
  format: keyof Omit<Text, 'text'>,
) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const addMarkData = (
  editor: Editor,
  data: { format: keyof Omit<Text, 'text'>; value?: string | boolean },
) => {
  // const isActive = isMarkActive(editor, format);
  const isActive = false;
  if (isActive) {
    // Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, data.format, data.value);
  }
};

export const isTextAlignActive = (editor, align) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n['textAlign'] === align,
    }),
  );

  return Boolean(match);
};

export const toggleTextAlign = (editor: Editor, align: TextAlignValueType) => {
  const isActive = isTextAlignActive(editor, align);

  let newProperties: Partial<Element>;
  if (Object.values(TextAlignValues).includes(align)) {
    newProperties = {
      textAlign: isActive ? undefined : align,
    };
  }

  Transforms.setNodes<Element>(editor, newProperties);
};

export const isBlockActive = (
  editor: Editor,
  expectedType: string,
  blockType = 'type',
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        n[blockType] === expectedType,
    }),
  );

  return Boolean(match);
};

export const toggleBlock = (editor: Editor, type: Element['type']) => {
  Transforms.setNodes(editor, { type });
};

export const getActiveBlockType = (
  editor: Editor,
  blockType = 'type',
): Element['type'] => {
  const { selection } = editor;
  if (!selection) return 'p';

  const pathClone = [...editor.selection.anchor.path];
  pathClone.pop(); // get rid of trailing text node postion in path.
  const anchorNode = pathClone.reduce((node: Element, pathPosition) => {
    if (!node) return editor.children[pathPosition];
    return node.children[pathPosition];
  }, null);

  // console.log(
  //   ';; ed-sel-start ',
  //   anchorNode['type'],
  //   // editor.selection?.anchor,
  // );

  if (['p', 'h1', 'h2', 'h3'].includes(anchorNode['type'])) {
    return anchorNode['type'];
  }

  return 'p';
};
