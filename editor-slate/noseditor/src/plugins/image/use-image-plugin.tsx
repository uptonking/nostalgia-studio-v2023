import React from 'react';

import { UseSlatePlugin } from '../types';
import Image from './components/image';
import { isImageElement } from './utils';
import { withImage } from './with-image';

const useImagePlugin: UseSlatePlugin = () => {
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

export default useImagePlugin;
