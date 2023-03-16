import React from 'react';

import { UseSlatePlugin } from '../types';
import Link from './components/link';
import { isLinkElement } from './utils';
import { withLink } from './with-link';

const useLinkPlugin: UseSlatePlugin = () => {
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

export default useLinkPlugin;
