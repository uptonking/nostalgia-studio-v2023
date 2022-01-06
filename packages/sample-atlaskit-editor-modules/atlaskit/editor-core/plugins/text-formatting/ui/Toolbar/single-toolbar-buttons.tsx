import { EditorView } from 'prosemirror-view';
import React, { useCallback } from 'react';

import { Command } from '../../../../types/command';
import ToolbarButton from '../../../../ui/ToolbarButton';
import { ButtonGroup } from '../../../../ui/styles';
import type { MenuIconItem } from './types';

export const SingleToolbarButtons: React.FC<{
  items: MenuIconItem[];
  isReducedSpacing: boolean;
  editorView: EditorView;
}> = React.memo(({ items, isReducedSpacing, editorView }) => {
  const onClick = useCallback(
    (command: Command) => {
      return () => {
        command(editorView.state, editorView.dispatch);

        return false;
      };
    },
    [editorView.state, editorView.dispatch],
  );
  return (
    <ButtonGroup width={isReducedSpacing ? 'small' : 'large'}>
      {items.map((item) => (
        <ToolbarButton
          key={item.key}
          buttonId={item.buttonId}
          spacing={isReducedSpacing ? 'none' : 'default'}
          onClick={onClick(item.command)}
          selected={item.isActive}
          disabled={item.isDisabled}
          title={item.tooltipElement}
          iconBefore={item.iconElement}
        />
      ))}
    </ButtonGroup>
  );
});
