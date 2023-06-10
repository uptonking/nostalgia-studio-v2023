import React from 'react';

import { type ElementProps } from '../../types';
import { type DividerElement } from '../types';

export const Divider = (props: ElementProps & { element: DividerElement }) => {
  const { children, attributes, element } = props;

  return (
    <div contentEditable={false} {...attributes}>
      {children}
      <hr style={{ userSelect: 'none' }} />
    </div>
  );
};

export default Divider;
