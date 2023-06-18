import React, { useEffect, useRef, useState } from 'react';

import {
  type ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
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
 * ✨ sort
 * - 要避免state变化时，watarble实例每次都创建新的
 */
export const A1b3Sort = () => {
  const containerRef = useRef(null);
  const watarble = useRef<Watarble | null>(null);

  const [data] = useState(() => [...defaultData]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (containerRef.current) {
      if (!watarble.current) {
        watarble.current = new Watarble({
          container: '.idEgRightContainer',
          data,
          // @ts-expect-error fix-types
          columns: columns,
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          state: {
            sorting,
          },
          onSortingChange: (v) => {
            setSorting(v);
            watarble.current?.state.dispatch();
          },
          debugTable: true,
        });
        window['wtbl'] = watarble.current;
        console.log(';; init-wtbl ', watarble.current?.id);
      }
    }
  }, [data, sorting]);

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container && watarble.current) {
        console.log(';; destroy3 ', watarble.current?.id);
        watarble.current?.destroy();
      }
    };
  }, []);

  console.log(';; app3 ', columns);

  return (
    <div>
      <h2> sort column</h2>
      <div ref={containerRef} className={tableBaseCss} />
    </div>
  );
};
