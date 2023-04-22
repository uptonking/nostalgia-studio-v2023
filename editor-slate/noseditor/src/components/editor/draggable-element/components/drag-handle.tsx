import React from 'react';

import cx from 'clsx';

import type { DraggableSyntheticListeners } from '@dnd-kit/core';

import { DragIcon } from '../../../icons';

type DragHandleProps = {
  listeners?: DraggableSyntheticListeners;
  classes?: string;
};

export const DragHandle = ({ listeners, classes }: DragHandleProps) => {
  return (
    <div
      contentEditable={false}
      className={'handle clipboardSkip ' + (classes || '')}
    >
      <button className='drag-trigger' {...listeners}>
        <DragIcon />
      </button>
    </div>
  );
};
