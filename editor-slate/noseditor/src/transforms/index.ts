import { Editor, Element, Text, Transforms } from 'slate';

import { TextAlignValues, TextAlignValueType } from '../utils';

export const toggleElement = (editor: Editor, type: Element['type']) => {
  Transforms.setNodes(editor, { type });
};

const isMarkActive = (editor: Editor, format: keyof Omit<Text, 'text'>) => {
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
  data: { format: keyof Omit<Text, 'text'>, value?: string|boolean },
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
