import React from 'react';

import cx from 'clsx';

import type { DraggableSyntheticListeners } from '@dnd-kit/core';

import { DragIcon } from '../../../../components/icons';

type Props = {
  listeners?: DraggableSyntheticListeners;
  classes?: string;
};

export const DragHandle = ({ listeners, classes }: Props) => {
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

export default DragHandle;
