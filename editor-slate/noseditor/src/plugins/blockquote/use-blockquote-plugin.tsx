import React from 'react';

import { UseNosPlugin } from '../types';
import { Blockquote } from './components/blockquote';
import { isBlockquoteElement } from './utils';

export const useBlockquotePlugin: UseNosPlugin = () => {
  return {
    renderElement: (props) => {
      if (isBlockquoteElement(props.element)) {
        return <Blockquote {...props} element={props.element} />;
      }

      return null;
    },
  };
};
