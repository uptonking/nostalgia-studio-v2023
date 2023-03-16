import React from 'react';

import { UseSlatePlugin } from '../types';
import Blockquote from './components/blockquote';
import { isBlockquoteElement } from './utils';

export const useBlockquotePlugin: UseSlatePlugin = () => {
  return {
    renderElement: (props) => {
      if (isBlockquoteElement(props.element)) {
        return <Blockquote {...props} element={props.element} />;
      }

      return null;
    },
  };
};

export default useBlockquotePlugin;
