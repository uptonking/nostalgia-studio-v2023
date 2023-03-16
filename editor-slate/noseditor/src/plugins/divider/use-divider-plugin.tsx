import React from 'react';

import { UseSlatePlugin } from '../types';
import Divider from './components/divider';
import { isDividerElement } from './utils';
import { withDivider } from './with-divider';

const useDividerPlugin: UseSlatePlugin = () => {
  return {
    withOverrides: withDivider,
    renderElement: (props) => {
      if (isDividerElement(props.element)) {
        return <Divider {...props} element={props.element} />;
      }

      return null;
    },
  };
};

export default useDividerPlugin;
