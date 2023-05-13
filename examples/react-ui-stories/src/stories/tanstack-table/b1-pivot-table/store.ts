import {
  ACTION_TYPES,
  type ActionTypesType,
  COLUMN_TYPES,
  makeData,
  randomColor,
  shortId,
} from './utils';

type ActionWithPayload = {
  type: (typeof ACTION_TYPES)[ActionTypesType];
  [k: string]: any;
};

export function reducer(state, action: ActionWithPayload) {
  switch (action.type) {
    case ACTION_TYPES.Add_option_to_column: {
      const columnToUpdate = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const columns = [...state.columns];
      columns[columnToUpdate].options.push({
        label: action.option,
        backgroundColor: action.backgroundColor,
      });
      return { ...state, columns };
    }
    case ACTION_TYPES.Add_row: {
      const data = [...state.data];
      data.push([{}]);
      return { ...state, data };
    }
    case ACTION_TYPES.Update_column_type: {
      const columnToUpdateIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const columnToUpdate = state.columns[columnToUpdateIndex];
      const columns = [...state.columns];
      switch (action.dataType) {
        // case COLUMN_TYPES.Number:
        //   if (state.columns[columnToUpdate].dataType === COLUMN_TYPES.Number) {
        //     return state;
        //   } else {
        //     return update(state, {
        //       skipReset: { $set: true },
        //       columns: { [columnToUpdate]: { dataType: { $set: action.dataType } } },
        //       data: {
        //         $apply: (data) =>
        //           data.map((row) => ({
        //             ...row,
        //             [action.columnId]: isNaN(row[action.columnId])
        //               ? ''
        //               : Number.parseInt(row[action.columnId], 10),
        //           })),
        //       },
        //     });
        //   }
        // case COLUMN_TYPES.Select:
        //   if (state.columns[columnToUpdate].dataType === COLUMN_TYPES.Select) {
        //     return state;
        //   } else {
        //     const options = [];
        //     state.data.forEach((row) => {
        //       if (row[action.columnId]) {
        //         options.push({
        //           label: row[action.columnId],
        //           backgroundColor: randomColor(),
        //         });
        //       }
        //     });
        //     return update(state, {
        //       skipReset: { $set: true },
        //       columns: {
        //         [columnToUpdate]: {
        //           dataType: { $set: action.dataType },
        //           options: { $push: options },
        //         },
        //       },
        //     });
        //   }
        case COLUMN_TYPES.Text: {
          if (columnToUpdate.dataType === COLUMN_TYPES.Text) {
            return state;
          } else if (columnToUpdate.dataType === COLUMN_TYPES.Select) {
            columns[columnToUpdateIndex].dataType = COLUMN_TYPES.Text;
            return { ...state, columns };
          } else {
            columns[columnToUpdateIndex].dataType = COLUMN_TYPES.Text;
            const data = state.data.map((row) => ({
              ...row,
              [action.columnId]: String(row[action.columnId]),
            }));
            return { ...state, columns, data };
          }
        }
        default:
          return state;
      }
    }
    case ACTION_TYPES.Update_column_header: {
      const columnToUpdate = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const columns = [...state.columns];
      columns[columnToUpdate].label = action.label;
      return { ...state, columns };
    }
    case ACTION_TYPES.Update_cell: {
      const data = [...state.data];
      const row = data[action.rowIndex];
      data[action.rowIndex] = { ...row, [action.columnId]: action.value };
      return { ...state, data };
    }
    case ACTION_TYPES.Add_column_to_left: {
      const leftIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const leftId = shortId();
      const columns = [...state.columns];
      columns.splice(leftIndex, 0, {
        id: leftId,
        accessorKey: leftId,
        label: 'Column',
        dataType: COLUMN_TYPES.Text,
        created: action.focus && true,
        options: [],
      });
      return { ...state, columns };
    }
    case ACTION_TYPES.Add_column_to_right: {
      const rightIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const rightId = shortId();
      const columns = [...state.columns];
      columns.splice(rightIndex + 1, 0, {
        id: rightId,
        accessorKey: rightId,
        label: 'Column',
        dataType: COLUMN_TYPES.Text,
        created: action.focus && true,
        options: [],
      });
      return { ...state, columns };
    }
    case ACTION_TYPES.Delete_column: {
      const deleteIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const columns = [...state.columns];
      columns.splice(deleteIndex, 1);
      return { ...state, columns };
    }
    case ACTION_TYPES.Enable_reset:
      return { ...state, skipReset: true };
    default:
      return state;
  }
}
