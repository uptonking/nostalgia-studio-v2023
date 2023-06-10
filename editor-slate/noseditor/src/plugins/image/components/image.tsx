import React from 'react';

import { type ElementProps } from '../../types';
import { type ImageElement } from '../types';

export const Image = (props: ElementProps & { element: ImageElement }) => {
  const { children, attributes, element } = props;

  return (
    <div className='image-wrapper' contentEditable={false}>
      <img
        style={{
          width: '100%',
        }}
        {...attributes}
        src={element.url}
      />
      <div className='image' />
      {children}
    </div>
  );
};
