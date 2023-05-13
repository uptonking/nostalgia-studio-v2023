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
      id: i,
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
    (option, i, self) => self.findIndex((b) => b.label === option.label) === i,
  );

  const columns = [
    {
      id: 'firstName',
      accessorKey: 'firstName',
      label: 'First Name',
      minSize: 100,
      dataType: COLUMN_TYPES.Text,
      options: [],
    },
    {
      id: 'lastName',
      accessorKey: 'lastName',
      label: 'Last Name',
      minSize: 100,
      dataType: COLUMN_TYPES.Text,
      options: [],
    },
    {
      id: 'age',
      accessorKey: 'age',
      label: 'Age',
      size: 80,
      dataType: COLUMN_TYPES.Number,
      options: [],
    },
    {
      id: 'email',
      accessorKey: 'email',
      label: 'Email',
      size: 300,
      dataType: COLUMN_TYPES.Text,
      options: [],
    },
    {
      id: 'music',
      accessorKey: 'music',
      label: 'Music Preference',
      dataType: COLUMN_TYPES.Select,
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

  return { columns, data, skipReset: false };
}

export const ACTION_TYPES = Object.freeze({
  Add_option_to_column: 'add_option_to_column',
  Add_row: 'add_row',
  Update_column_type: 'update_column_type',
  Update_column_header: 'update_column_header',
  Update_cell: 'update_cell',
  Add_column_to_left: 'add_column_to_left',
  Add_column_to_right: 'add_column_to_right',
  Delete_column: 'delete_column',
  Enable_reset: 'enable_reset',
});

export type ActionTypesType = keyof typeof ACTION_TYPES;

export const COLUMN_TYPES = Object.freeze({
  Number: 'number',
  Text: 'text',
  Select: 'select',
});

export const COLUMN_PLACEHOLDER_ID = 99999999;

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
