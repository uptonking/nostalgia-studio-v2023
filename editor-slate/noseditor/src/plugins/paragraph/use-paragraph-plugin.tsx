import React from 'react';

import type { CreateNosPluginType } from '../types';
import { Paragraph } from './components/paragraph';
import { isParagraphElement } from './utils';

export const useParagraphPlugin: CreateNosPluginType = () => {
  return {
    renderElement: (props) => {
      if (isParagraphElement(props.element)) {
        return <Paragraph {...props} element={props.element} />;
      }

      return null;
    },
  };
};
