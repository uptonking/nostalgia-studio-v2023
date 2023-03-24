import { Element } from 'slate';

import type {
  ListItemElement,
  ListItemType,
  TodoListItemElement,
} from './types';

export const ListItemSpec: ListItemType = 'list_item';

export const ListTypes = {
  Bulleted: 'bulleted',
  Numbered: 'numbered',
  TodoList: 'todoList',
} as const;

export const isListItemElement = (value: any): value is ListItemElement => {
  return Element.isElementType<ListItemElement>(value, ListItemSpec);
};

export const isTodoListItemElement = (
  value: any,
): value is TodoListItemElement => {
  return (
    Element.isElementType<TodoListItemElement>(value, ListItemSpec) &&
    value.listType === ListTypes.TodoList
  );
};
