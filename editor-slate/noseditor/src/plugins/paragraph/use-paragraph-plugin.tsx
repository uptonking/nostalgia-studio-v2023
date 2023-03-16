import React from 'react';

import { UseSlatePlugin } from '../types';
import Paragraph from './components/paragraph';
import { isParagraphElement } from './utils';

const useParagraphPlugin: UseSlatePlugin = () => {
  return {
    renderElement: (props) => {
      if (isParagraphElement(props.element)) {
        return <Paragraph {...props} element={props.element} />;
      }

      return null;
    },
  };
};

export default useParagraphPlugin;
