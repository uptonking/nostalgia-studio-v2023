import React from 'react';

import type { ElementProps } from '../../types';
import type { ParagraphElement } from '../types';

export const Paragraph = (props: ElementProps & { element: ParagraphElement }) => {
  const { children, attributes } = props;

  return (
    <p {...attributes} className='nos-elem text-p'>
      {children}
    </p>
  );
};

export default Paragraph;
