import React, { useMemo } from 'react';

import { uniq } from 'lodash-es';

import { RecordFactory } from '@datalking/pivot-core';
import { useGetRecordsQuery } from '@datalking/pivot-store';
import type { MultiSelectProps, SelectItem } from '@datalking/pivot-ui';
import { MultiSelect, useDisclosure } from '@datalking/pivot-ui';

import { useCurrentTable } from '../../hooks/use-current-table';

type IProps = Omit<MultiSelectProps, 'data'>;

export const RecordsPicker: React.FC<IProps> = (props) => {
  const table = useCurrentTable();
  const schema = table.schema.toIdMap();

  const [focused, handler] = useDisclosure();
  const { data, isLoading } = useGetRecordsQuery(
    {
      tableId: table.id.value,
    },
    {
      skip: !focused,
    },
  );

  const records = useMemo(
    () =>
      RecordFactory.fromQueryRecords(
        (Object.values(data?.entities ?? {}) ?? []).filter(Boolean),
        schema,
      ),
    [data],
  );

  const ids = uniq([...(props.value ?? []), ...records.map((r) => r.id.value)]);
  const items: SelectItem[] = ids.map((id) => ({ value: id, label: id }));

  return (
    <MultiSelect
      {...props}
      multiple
      searchable
      clearable
      onBlur={handler.close}
      onFocus={handler.open}
      disabled={focused && isLoading}
      data={items}
    />
  );
};
