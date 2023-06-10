import { Editor, type Element } from 'slate';

import { type CreateNosPluginType } from '../types';
import { type DraggableCollapsibleEditor } from './collapsible-editor';
import { compareLevels as compare } from './utils';
import { withDraggableCollapsible } from './with-draggable-collapsible';

type CollapsibleOptions = {
  compareLevels?: (
    editor: DraggableCollapsibleEditor,
  ) => (a: Element, b: Element) => number;
};

export const useDraggableCollapsiblePlugin: CreateNosPluginType<
  CollapsibleOptions
> = ({ compareLevels = compare } = {}) => {
  return {
    withOverrides: withDraggableCollapsible({ compareLevels }),
  };
};
