import React, { useEffect, useReducer, useRef, useState } from 'react';

import {
  type ColumnDef,
  functionalUpdate,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/table-core';

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
export const A1b4UndoRedo = () => {
  const forceUpdate = useReducer(() => ({}), 1)[1];
  const containerRef = useRef(null);
  const watarble = useRef<Watarble | null>(null);

  const [data] = useState(() => [...defaultData]);

  useEffect(() => {
    if (containerRef.current) {
      if (!watarble.current) {
        watarble.current = new Watarble({
          container: '.idEgRightContainer',
          onStateChange: forceUpdate,
          table: {
            data,
            // @ts-expect-error fix-types
            columns: columns,
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
            state: {
              sorting: [],
            },
            onSortingChange: (updater) => {
              // const newSorting = updater(watarble.current!.state.getters.getSortingState())
              const newSorting =
                typeof updater === 'function'
                  ? functionalUpdate(
                      updater,
                      watarble.current!.state.getters.getSortingState(),
                    )
                  : updater;
              // console.log(';; chg-newSorting ', newSorting);
              watarble.current?.state.dispatch('UPDATE_COLUMN_SORTING', {
                sorting: newSorting,
              });
            },
            debugTable: true,
          },
        });
        window['wtbl'] = watarble.current;
        console.log(';; init-wtbl ', watarble.current?.id);
      }
    }
  }, [data, forceUpdate]);

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container && watarble.current) {
        console.log(';; destroy4 ', watarble.current?.id);
        watarble.current?.destroy();
      }
    };
  }, []);

  console.log(
    ';; app4-undo ',
    window['undo']?.length,
    window['redo']?.length,
    columns,
  );

  return (
    <div>
      <h2>undo/redo</h2>
      <div
        style={{
          display: 'flex',
          // justifyContent: 'space-around',
          borderStyle: 'solid',
          borderWidth: 4,
          borderColor: watarble.current?.state.getters.getOutlineBorderColor(),
        }}
      >
        <div>
          <button
            onClick={() => {
              watarble.current?.state.dispatch('REQUEST_UNDO');
            }}
          >
            undo
          </button>
          <button
            onClick={() => {
              watarble.current?.state.dispatch('REQUEST_REDO');
            }}
          >
            redo
          </button>
        </div>
        <button
          onClick={() => {
            watarble.current?.state.dispatch('SET_OUTLINE_BORDER_COLOR');
          }}
        >
          Change Border color
        </button>
        <button
          style={{
            backgroundColor:
              watarble.current?.state.getters.getOutlineBorderColor(),
            padding: '3px 6px',
          }}
        >
          color: {watarble.current?.state.getters.getOutlineBorderColor()}
        </button>
      </div>

      <div ref={containerRef} className={tableBaseCss} />
    </div>
  );
};
