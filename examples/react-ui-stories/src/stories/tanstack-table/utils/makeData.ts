import { size } from 'lodash';

import { faker } from '@faker-js/faker';
import { ColumnDef, ColumnSort, SortingState } from '@tanstack/table-core';

export type Person = {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  progress: number;
  // status: 'relationship' | 'complicated' | 'single'
  status: string;
  createdAt?: Date;
  subRows?: Person[];
};

const range = (len: number) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = (index = 0): Person => {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: faker.datatype.number(40),
    visits: faker.datatype.number(1000),
    progress: faker.datatype.number(100),
    status: faker.helpers.shuffle<Person['status']>([
      'relationship',
      'complicated',
      'single',
    ])[0]!,
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!;
    return range(len).map((d, index): Person => {
      return {
        ...newPerson(),
        id: index + 1,
        createdAt: faker.datatype.datetime({ max: new Date().getTime() }),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
}

const data = makeData(10000);

export async function fetchData(options: {
  pageIndex: number;
  pageSize: number;
}) {
  // Simulate some network latency
  await new Promise((r) => setTimeout(r, 500));

  return {
    rows: data.slice(
      options.pageIndex * options.pageSize,
      (options.pageIndex + 1) * options.pageSize,
    ),
    pageCount: Math.ceil(data.length / options.pageSize),
  };
}

export const tableColumns: ColumnDef<Person>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 60,
  },
  {
    accessorKey: 'firstName',
    cell: (info) => info.getValue(),
  },
  {
    accessorFn: (row) => row.lastName,
    id: 'lastName',
    cell: (info) => info.getValue(),
    // header: () => <>Last Name</ span >,
    header: () => 'Last Name',
  },
  {
    accessorKey: 'age',
    header: () => 'Age',
    size: 50,
  },
  {
    accessorKey: 'visits',
    // header: () => <span>Visits < /span>,
    header: () => 'Visits',
    size: 50,
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'progress',
    header: 'Profile Progress',
    size: 80,
  },
  // {
  //   accessorKey: 'createdAt',
  //   header: 'Created At',
  //   cell: (info) => info.getValue<Date>().toLocaleString(),
  // },
];

export type PersonApiResponse = {
  data: Person[];
  meta: {
    totalRowCount: number;
  };
};

/** simulates a paginateable backend api */
export const fetchVirtualPagesData = (
  start: number,
  size: number,
  sorting: SortingState,
) => {
  const dbData = [...data];
  if (sorting.length) {
    const sort = sorting[0] as ColumnSort;
    const { id, desc } = sort as { id: keyof Person; desc: boolean };
    dbData.sort((a, b) => {
      if (desc) {
        return a[id] < b[id] ? 1 : -1;
      }
      return a[id] > b[id] ? 1 : -1;
    });
  }

  return {
    data: dbData.slice(start, start + size),
    meta: {
      totalRowCount: dbData.length,
    },
  };
};
