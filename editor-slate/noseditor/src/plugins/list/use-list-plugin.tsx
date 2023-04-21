import React from 'react';

import { CreateNosPluginType } from '../types';
import { ListItem } from './components/list-item';
import * as handlers from './handlers';
import { isListItemElement } from './utils';
import { withList } from './with-list';

export const useListPlugin: CreateNosPluginType = () => {
  return {
    withOverrides: withList,
    handlers,
    renderElement: (props) => {
      if (isListItemElement(props.element)) {
        return <ListItem {...props} element={props.element} />;
      }

      return null;
    },
  };
};
