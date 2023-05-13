import { faker } from '@faker-js/faker';

export function shortId() {
  return '_' + Math.random().toString(36).substring(2, 10);
}

export function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`;
}

export function makeData(count: number) {
  const data = [];
  let options = [];
  for (let i = 0; i < count; i++) {
    const row = {
      ID: i,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      age: Math.floor(20 + Math.random() * 20),
      music: faker.music.genre(),
    };

    options.push({ label: row.music, backgroundColor: randomColor() });
    data.push(row);
  }

  options = options.filter(
    (a, i, self) => self.findIndex((b) => b.label === a.label) === i,
  );

  const columns = [
    {
      id: 'firstName',
      accessorKey: 'firstName',
      label: 'First Name',
      minSize: 100,
      dataType: ColumnTypes.TEXT,
      options: [],
    },
    {
      id: 'lastName',
      accessorKey: 'lastName',
      label: 'Last Name',
      minSize: 100,
      dataType: ColumnTypes.TEXT,
      options: [],
    },
    {
      id: 'age',
      accessorKey: 'age',
      label: 'Age',
      size: 80,
      dataType: ColumnTypes.NUMBER,
      options: [],
    },
    {
      id: 'email',
      accessorKey: 'email',
      label: 'Email',
      size: 300,
      dataType: ColumnTypes.TEXT,
      options: [],
    },
    {
      id: 'music',
      accessorKey: 'music',
      label: 'Music Preference',
      dataType: ColumnTypes.SELECT,
      size: 200,
      options: options,
    },
    // {
    //   id: Constants.ADD_COLUMN_ID,
    //   label: '+',
    //   size: 20,
    //   disableResizing: true,
    //   dataType: 'null',
    // },
  ];

  return { columns: columns, data: data, skipReset: false };
}

export const ActionNames = Object.freeze({
  ADD_OPTION_TO_COLUMN: 'add_option_to_column',
  ADD_ROW: 'add_row',
  UPDATE_COLUMN_TYPE: 'update_column_type',
  UPDATE_COLUMN_HEADER: 'update_column_header',
  UPDATE_CELL: 'update_cell',
  ADD_COLUMN_TO_LEFT: 'add_column_to_left',
  ADD_COLUMN_TO_RIGHT: 'add_column_to_right',
  DELETE_COLUMN: 'delete_column',
  ENABLE_RESET: 'enable_reset',
});

export const ColumnTypes = Object.freeze({
  NUMBER: 'number',
  TEXT: 'text',
  SELECT: 'select',
});

export const Constants = Object.freeze({
  ADD_COLUMN_ID: 999999,
});

/** get a gray color by level, from 50,100,200,...,900 */
export function grey(level: number) {
  const reference = {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  };

  return reference[level];
}

export const sortByAlphanumericFalsyLast = (rowA, rowB, columnId, desc) => {
  if (!rowA.values[columnId] && !rowB.values[columnId]) {
    return 0;
  }

  if (!rowA.values[columnId]) {
    return desc ? -1 : 1;
  }

  if (!rowB.values[columnId]) {
    return desc ? 1 : -1;
  }

  return isNaN(rowA.values[columnId])
    ? rowA.values[columnId].localeCompare(rowB.values[columnId])
    : rowA.values[columnId] - rowB.values[columnId];
};
