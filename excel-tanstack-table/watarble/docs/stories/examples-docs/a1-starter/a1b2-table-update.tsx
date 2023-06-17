import React, { useEffect, useRef, useState } from 'react';

import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
} from '@tanstack/react-table';

import { Watarble } from '../../../../src';
import { tableBaseCss } from '../editor-examples.styles';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
];

const columns: ColumnDef<Person>[] = [
  {
    header: 'Name',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'firstName',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.lastName,
        id: 'lastName',
        cell: (info) => info.getValue(),
        // header: () => <span>Last Name</span>,
        header: () => 'Last Name',
        footer: (props) => props.column.id,
      },
    ],
  },
  {
    header: 'Info',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'age',
        header: () => 'Age',
        footer: (props) => props.column.id,
      },
      {
        header: 'More Info',
        columns: [
          {
            accessorKey: 'visits',
            // header: () => <span>Visits</span>,
            header: () => 'Visits',
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'status',
            header: 'Status',
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'progress',
            header: 'Profile Progress',
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
  },
];
window['col'] = columns;

/**
 * ✨ 最小react-table示例，仅展示
 */
export const A1b2UpdateTbl = () => {
  const containerRef = useRef(null);

  const [data, setData] = React.useState(() => [...defaultData]);
  const refreshData = () => setData(() => [...defaultData.reverse()]);

  useEffect(() => {
    if (containerRef.current) {
      const watarble = new Watarble({
        container: '.idEgRightContainer',
        data,
        // @ts-expect-error fix-types
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: 'onChange',
        debugTable: true,
      });
      window['wt'] = watarble;
      console.log(';; init-tbl ', watarble?.id);
    }
  }, [data]);

  console.log(';; app ', columns);

  return (
    <div>
      <h2> update table</h2>
      <div ref={containerRef} className={tableBaseCss} />
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
    </div>
  );
};
