import React from 'react';

import { ElementProps } from '../../types';
import { ParagraphElement } from '../types';

const Paragraph = (props: ElementProps & { element: ParagraphElement }) => {
  const { children, attributes } = props;

  return (
    <p {...attributes} className='slate-p'>
      {children}
    </p>
  );
};

export default Paragraph;
