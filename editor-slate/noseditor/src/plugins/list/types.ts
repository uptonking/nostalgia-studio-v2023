import { Descendant } from 'slate';

import type {
  FoldingElement,
  NestingElement,
} from '../../slate-extended/types';
import type { ListVariants } from './utils';

export type ListItemType = 'list_item';

type BaseListItemElement = {
  type: ListItemType;
  children: Descendant[];
} & NestingElement &
  FoldingElement;

type BulletedListItemElement = BaseListItemElement & {
  listType: typeof ListVariants['Bulleted'];
};

type NumberedListItemElement = BaseListItemElement & {
  listType: typeof ListVariants['Numbered'];
};

export type TodoListItemElement = BaseListItemElement & {
  listType: typeof ListVariants['TodoList'];
  checked: boolean;
};

export type ListItemElement =
  | BulletedListItemElement
  | NumberedListItemElement
  | TodoListItemElement;
