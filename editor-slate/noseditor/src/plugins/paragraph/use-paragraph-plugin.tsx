import React from 'react';

import { UseNosPlugin } from '../types';
import { Paragraph } from './components/paragraph';
import { isParagraphElement } from './utils';

export const useParagraphPlugin: UseNosPlugin = () => {
  return {
    renderElement: (props) => {
      if (isParagraphElement(props.element)) {
        return <Paragraph {...props} element={props.element} />;
      }

      return null;
    },
  };
};

