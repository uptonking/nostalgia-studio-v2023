import React, { forwardRef } from 'react';

import { identity } from 'lodash-es';

import type { Field, IFieldType } from '@datalking/pivot-core';
import { TableFactory } from '@datalking/pivot-core';
import { useGetTableQuery } from '@datalking/pivot-store';
import type {
  MultiSelectProps,
  SelectItem as SelectItemType,
} from '@datalking/pivot-ui';
import {
  ActionIcon,
  Group,
  MultiSelect,
  Text,
  useListState,
} from '@datalking/pivot-ui';

import { FieldIcon } from './field-Icon';
import type { FieldBase } from './field-picker.type';

export interface IForeignTablePickerProps
  extends Omit<MultiSelectProps, 'data'> {
  foreignTableId?: string;
  fields?: FieldBase[];
  fieldFilter?: (f: Field) => boolean;
  multiple?: boolean;
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  value: string;
  label: string;
  type: IFieldType;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, type, ...others }: ItemProps, ref) => (
    <Group ref={ref} p='xs' {...others}>
      <ActionIcon size='sm'>
        <FieldIcon type={type} />
      </ActionIcon>
      <Text>{label}</Text>
    </Group>
  ),
);

export const ForeignFieldsPicker: React.FC<IForeignTablePickerProps> = ({
  foreignTableId,
  fields,
  fieldFilter,
  multiple = true,
  ...props
}) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data } = useGetTableQuery(
    { id: foreignTableId! },
    { skip: !foreignTableId },
  );
  const [state, handlers] = useListState<string>(props.value);

  const table = data ? TableFactory.fromQuery(data as any) : undefined;

  const items =
    table?.schema?.fields.filter(fieldFilter ?? identity).map((f, index) => ({
      value: f.id.value,
      label: f.name.value || `Field ` + (index + 1),
      type: f.type,
    })) ??
    fields?.map((f) => ({ value: f.id, label: f.name, type: f.type })) ??
    ([] as SelectItemType[]);

  return (
    <MultiSelect
      maxSelectedValues={multiple ? undefined : 1}
      variant='filled'
      multiple={multiple}
      {...props}
      value={state}
      onChange={(value) => {
        handlers.setState(value);
        props.onChange?.(value);
      }}
      data={items}
      itemComponent={SelectItem}
      withinPortal
    />
  );
};
