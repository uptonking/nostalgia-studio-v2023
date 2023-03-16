import React from 'react';

import { ElementProps } from '../../types';
import { BlockquoteElement } from '../types';

const Blockquote = (props: ElementProps & { element: BlockquoteElement }) => {
  const { children, attributes } = props;

  return <blockquote {...attributes}>{children}</blockquote>;
};

export default Blockquote;
