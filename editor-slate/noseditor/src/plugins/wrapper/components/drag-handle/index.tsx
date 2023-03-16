import React from 'react';

import cx from 'classnames';

import { DraggableSyntheticListeners } from '@dnd-kit/core';

type Props = {
  listeners?: DraggableSyntheticListeners;
  classes?: string;
};

export const DragHandle = ({ listeners, classes }: Props) => {
  return (
    <button
      contentEditable={false}
      className={'handle clipboardSkip ' + (classes || '')}
      {...listeners}
    >
      ⠿
    </button>
  );
};

export default DragHandle;
