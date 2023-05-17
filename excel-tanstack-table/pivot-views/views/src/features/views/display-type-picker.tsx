import React, { forwardRef } from 'react';

import { useTranslation } from 'react-i18next';

import type { IViewDisplayType } from '@datalking/pivot-core';
import type { SelectProps } from '@datalking/pivot-ui';
import { ActionIcon, Group, Select, Text } from '@datalking/pivot-ui';

import { displayTypes } from '../view/display-type';
import {
  DisplayTypeIcon,
  getDisplayTypeColor,
} from '../view/display-type-icon';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  value: IViewDisplayType;
  label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, value, ...others }: ItemProps, ref) => {
    const { t } = useTranslation();
    return (
      <Group ref={ref} p='xs' {...others}>
        <ActionIcon bg={getDisplayTypeColor(value)} size='sm'>
          <DisplayTypeIcon displayType={value} size={18} color='white' />
        </ActionIcon>
        <Text>{t(label)}</Text>
      </Group>
    );
  },
);

export const DisplayTypePicker: React.FC<Omit<SelectProps, 'data'>> = (
  props,
) => {
  const { t } = useTranslation();

  return (
    <Select
      icon={<DisplayTypeIcon displayType={props.value as IViewDisplayType} />}
      data={displayTypes.map((v) => ({
        value: v.value,
        label: t(v.label) as string,
      }))}
      {...props}
      itemComponent={SelectItem}
      withinPortal
    />
  );
};
