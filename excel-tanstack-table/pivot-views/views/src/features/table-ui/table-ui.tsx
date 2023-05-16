import { useMemo } from 'react';

import { RecordFactory } from '@datalking/pivot-core';
import { LoadingOverlay, useDebouncedValue } from '@datalking/pivot-ui';
import loadable from '@loadable/component';

import { useCurrentTable } from '../../hooks/use-current-table';
import { useFetchRecords } from '../../hooks/use-fetch-records';
import { LoadingTable } from './loading';

const EGOTable = loadable(() => import('./table'));

export const TableUI: React.FC = () => {
  const table = useCurrentTable();
  const schema = table.schema.toIdMap();

  const { rawRecords, isLoading, isFetching } = useFetchRecords();
  const records = useMemo(
    () => RecordFactory.fromQueryRecords(rawRecords, schema),
    [rawRecords, schema],
  );

  const [deboundedIsFetching] = useDebouncedValue(isFetching, 200);

  if (isLoading) {
    return <LoadingTable />;
  }

  return (
    <>
      <LoadingOverlay visible={deboundedIsFetching} />
      <EGOTable records={records} />
    </>
  );
};
