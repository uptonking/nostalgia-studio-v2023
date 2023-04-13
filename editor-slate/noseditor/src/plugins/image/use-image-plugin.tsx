import React from 'react';

import type { UseNosPlugin } from '../types';
import { Image } from './components/image';
import { isImageElement } from './utils';
import { withImage } from './with-image';

export const useImagePlugin: UseNosPlugin = () => {
  return {
    withOverrides: withImage,
    renderElement: (props) => {
      if (isImageElement(props.element)) {
        return <Image {...props} element={props.element} />;
      }

      return null;
    },
  };
};
