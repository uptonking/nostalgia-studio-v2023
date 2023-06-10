import { type Descendant } from 'slate';

export type DividerType = 'hr';

export type DividerElement = {
  type: DividerType;
  children: Descendant[];
};
