import React from 'react';

import { UseNosPlugin } from '../types';
import { Divider } from './components/divider';
import { isDividerElement } from './utils';
import { withDivider } from './with-divider';

export const useDividerPlugin: UseNosPlugin = () => {
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