import React, { useEffect, useRef, useState } from 'react';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { tableBaseCss, tableTailwindCss } from '../examples.styles';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: 'single' | 'relationship' | 'complicated';
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'Dit',
    age: 45,
    visits: 20,
    status: 'complicated',
    progress: 10,
  },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('firstName', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    header: () => <span>Last Name</span>,
    cell: (info) => <i>{info.getValue()}</i>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('age', {
    header: () => 'Age',
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('visits', {
    header: () => <span>Visits</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('progress', {
    header: 'Profile Progress',
    footer: (info) => info.column.id,
  }),
];
window['col'] = columns;

/**
 * ✨ 最小react-table示例，仅展示
 */
export const A1b1TableStarter = () => {
  const [data] = React.useState(() => [...defaultData]);
  const rerender = React.useReducer(() => ({}), {})[1];

  // console.log(';; col-data ', columns, data)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  window['table'] = table;

  // start from getPaginationRowModel, then create row only, but not create cell
  const rowModel = table.getRowModel();
  // create header group
  const headerGroups = table.getHeaderGroups();
  const footerGroups = table.getFooterGroups();

  // console.log(';; rows ', rowModel, headerGroups, footerGroups);

  return (
    <div className={tableBaseCss}>
      <h2> react-table v8 minimal starter example</h2>
      <table>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rowModel.rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {footerGroups.map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <button onClick={() => rerender()} className='border p-2'>
        Rerender
      </button>
    </div>
  );
};
