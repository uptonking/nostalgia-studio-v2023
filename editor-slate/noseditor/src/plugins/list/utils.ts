import { Editor, Element } from 'slate';

import type {
  BulletedListItemElement,
  CheckboxListItemElement,
  ListItemElement,
  ListItemType,
  NumberedListItemElement,
} from './types';

export const ListItemSpec: ListItemType = 'listItem';

export const ListVariants = {
  Bulleted: 'bulleted',
  Numbered: 'numbered',
  Checkbox: 'checkbox',
} as const;

export type ListVariantsType = (typeof ListVariants)[keyof typeof ListVariants];

export const isListItemElement = (value: any): value is ListItemElement => {
  return (
    !Editor.isEditor(value) &&
    Element.isElementType<ListItemElement>(value, ListItemSpec)
  );
};

export const isBulletedListItemElement = (
  value: any,
): value is BulletedListItemElement => {
  return isListItemElement(value) && value.listType === ListVariants.Bulleted;
};

export const isNumberedListItemElement = (
  value: any,
): value is NumberedListItemElement => {
  return isListItemElement(value) && value.listType === ListVariants.Numbered;
};

export const isCheckboxListItemElement = (
  value: any,
): value is CheckboxListItemElement => {
  return isListItemElement(value) && value.listType === ListVariants.Checkbox;
};

export const createListItemElement = (
  listItemProps: Partial<ListItemElement> = {},
): ListItemElement => {
  const listItem: Partial<ListItemElement> = {
    listType: ListVariants.Bulleted,
    depth: 0,
    ...listItemProps,
  };

  return {
    type: ListItemSpec,
    children: [
      {
        text: '',
      },
    ],
    listType: listItem.listType,
    checked: false,
    depth: listItem.depth,
  };
};
