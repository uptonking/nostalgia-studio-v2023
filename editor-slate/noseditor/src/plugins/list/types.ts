import { Descendant } from 'slate';

import type {
  FoldingElement,
  NestingElement,
} from '../../slate-extended/types';
import type { ListTypes } from './utils';

export type ListItemType = 'list_item';

type BaseListItemElement = {
  type: ListItemType;
  children: Descendant[];
} & NestingElement &
  FoldingElement;

type BulletedListItemElement = BaseListItemElement & {
  listType: typeof ListTypes['Bulleted'];
};

type NumberedListItemElement = BaseListItemElement & {
  listType: typeof ListTypes['Numbered'];
};

export type TodoListItemElement = BaseListItemElement & {
  listType: typeof ListTypes['TodoList'];
  checked: boolean;
};

export type ListItemElement =
  | BulletedListItemElement
  | NumberedListItemElement
  | TodoListItemElement;
