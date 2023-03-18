import './blockquote.css';

import React from 'react';

import { ElementProps } from '../../types';
import { BlockquoteElement } from '../types';

export const Blockquote = (
  props: ElementProps & { element: BlockquoteElement },
) => {
  const { children, attributes } = props;

  return (
    <blockquote className='nos-elem-blockquote' {...attributes}>
      {children}
    </blockquote>
  );
};

export default Blockquote;
