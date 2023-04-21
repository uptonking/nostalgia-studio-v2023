import React from 'react';

import type { CreateNosPluginType } from '../types';
import { Blockquote } from './components/blockquote';
import { isBlockquoteElement } from './utils';

export const useBlockquotePlugin: CreateNosPluginType = () => {
  return {
    renderElement: (props) => {
      if (isBlockquoteElement(props.element)) {
        return <Blockquote {...props} element={props.element} />;
      }

      return null;
    },
  };
};
