import './styles.scss';

import React from 'react';

import type { ElementProps } from '../../types';
import type { BlockquoteElement } from '../types';

export const Blockquote = (
  props: ElementProps & { element: BlockquoteElement },
) => {
  const { children, attributes } = props;

  return (
    <blockquote className='nos-elem blockquote' {...attributes}>
      {children}
    </blockquote>
  );
};

export default Blockquote;
