import React from 'react';

import { UseNosPlugin } from '../types';
import Link from './components/link';
import { isLinkElement } from './utils';
import { withLink } from './with-link';

export const useLinkPlugin: UseNosPlugin = () => {
  return {
    withOverrides: withLink,
    renderElement: (props) => {
      if (isLinkElement(props.element)) {
        return <Link {...props} element={props.element} />;
      }

      return null;
    },
  };
};

