import React from 'react';

import { type IViewDisplayType } from '@datalking/pivot-core';
import {
  type DefaultMantineColor,
  type TablerIconsProps,
} from '@datalking/pivot-ui';
import {
  IconCalendar,
  IconHierarchy,
  IconLayoutKanban,
  IconTable,
} from '@datalking/pivot-ui';

export interface IProps extends TablerIconsProps {
  displayType: IViewDisplayType;
}

export const getDisplayTypeColor = (
  displayType: IViewDisplayType,
): DefaultMantineColor => {
  switch (displayType) {
    case 'grid':
      return 'blue';
    case 'calendar':
      return 'pink';
    case 'kanban':
      return 'orange';
    case 'tree':
      return 'green';
  }
};

export const DisplayTypeIcon: React.FC<IProps> = ({ displayType, ...rest }) => {
  switch (displayType) {
    case 'grid':
      return <IconTable size={18} {...rest} />;
    case 'kanban':
      return <IconLayoutKanban size={18} {...rest} />;
    case 'calendar':
      return <IconCalendar size={18} {...rest} />;
    case 'tree':
      return <IconHierarchy size={18} {...rest} />;

    default:
      return null;
  }
};
