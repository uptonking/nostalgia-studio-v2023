import type { Descendant } from 'slate';

import type { CollapsibleElement } from '../draggable-collapsible-feature/types';

export type Heading1Type = 'h1';
export type Heading2Type = 'h2';
export type Heading3Type = 'h3';

export type Heading1Element = {
  // id: string;
  type: Heading1Type;
  children: Descendant[];
} & CollapsibleElement;

export type Heading2Element = {
  // id: string;
  type: Heading2Type;
  children: Descendant[];
} & CollapsibleElement;

export type Heading3Element = {
  // id: string;
  type: Heading3Type;
  children: Descendant[];
} & CollapsibleElement;
