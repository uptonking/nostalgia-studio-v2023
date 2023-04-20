import { Editor } from 'slate';

import { compareLevels as compare } from '../../components/utils';
import { UseNosPlugin } from '../types';
import { DraggableCollapsibleEditor } from './collapsible-editor';
import { withDraggableCollapsible } from './with-draggable-collapsible';

type CollapsibleOptions = {
  compareLevels?: (
    editor: Editor,
  ) => DraggableCollapsibleEditor['compareLevels'];
};

export const useDraggableCollapsiblePlugin: UseNosPlugin<
  CollapsibleOptions
> = ({ compareLevels = compare } = {}) => {
  return {
    withOverrides: withDraggableCollapsible({ compareLevels }),
  };
};
