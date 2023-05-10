import update from 'immutability-helper';

import {
  ActionNames,
  ColumnTypes,
  makeData,
  randomColor,
  shortId,
} from './utils';

export function reducer(state, action) {
  switch (action.type) {
    case ActionNames.ADD_OPTION_TO_COLUMN: {
      const optionIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      return update(state, {
        skipReset: { $set: true },
        columns: {
          [optionIndex]: {
            options: {
              $push: [
                {
                  label: action.option,
                  backgroundColor: action.backgroundColor,
                },
              ],
            },
          },
        },
      });
    }
    case ActionNames.ADD_ROW:
      return update(state, {
        skipReset: { $set: true },
        data: { $push: [{}] },
      });
    case ActionNames.UPDATE_COLUMN_TYPE: {
      const typeIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      switch (action.dataType) {
        case ColumnTypes.NUMBER:
          if (state.columns[typeIndex].dataType === ColumnTypes.NUMBER) {
            return state;
          } else {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
              data: {
                $apply: (data) =>
                  data.map((row) => ({
                    ...row,
                    [action.columnId]: isNaN(row[action.columnId])
                      ? ''
                      : Number.parseInt(row[action.columnId], 10),
                  })),
              },
            });
          }
        case ColumnTypes.SELECT:
          if (state.columns[typeIndex].dataType === ColumnTypes.SELECT) {
            return state;
          } else {
            const options = [];
            state.data.forEach((row) => {
              if (row[action.columnId]) {
                options.push({
                  label: row[action.columnId],
                  backgroundColor: randomColor(),
                });
              }
            });
            return update(state, {
              skipReset: { $set: true },
              columns: {
                [typeIndex]: {
                  dataType: { $set: action.dataType },
                  options: { $push: options },
                },
              },
            });
          }
        case ColumnTypes.TEXT:
          if (state.columns[typeIndex].dataType === ColumnTypes.TEXT) {
            return state;
          } else if (state.columns[typeIndex].dataType === ColumnTypes.SELECT) {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
            });
          } else {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
              data: {
                $apply: (data) =>
                  data.map((row) => ({
                    ...row,
                    [action.columnId]: String(row[action.columnId]),
                  })),
              },
            });
          }
        default:
          return state;
      }
    }
    case ActionNames.UPDATE_COLUMN_HEADER: {
      const index = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      return update(state, {
        skipReset: { $set: true },
        columns: { [index]: { label: { $set: action.label } } },
      });
    }
    case ActionNames.UPDATE_CELL:
      return update(state, {
        skipReset: { $set: true },
        data: {
          [action.rowIndex]: { [action.columnId]: { $set: action.value } },
        },
      });
    case ActionNames.ADD_COLUMN_TO_LEFT: {
      const leftIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const leftId = shortId();
      return update(state, {
        skipReset: { $set: true },
        columns: {
          $splice: [
            [
              leftIndex,
              0,
              {
                id: leftId,
                label: 'Column',
                accessor: leftId,
                dataType: ColumnTypes.TEXT,
                created: action.focus && true,
                options: [],
              },
            ],
          ],
        },
      });
    }
    case ActionNames.ADD_COLUMN_TO_RIGHT: {
      const rightIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      const rightId = shortId();
      return update(state, {
        skipReset: { $set: true },
        columns: {
          $splice: [
            [
              rightIndex + 1,
              0,
              {
                id: rightId,
                label: 'Column',
                accessor: rightId,
                dataType: ColumnTypes.TEXT,
                created: action.focus && true,
                options: [],
              },
            ],
          ],
        },
      });
    }
    case ActionNames.DELETE_COLUMN: {
      const deleteIndex = state.columns.findIndex(
        (column) => column.id === action.columnId,
      );
      return update(state, {
        skipReset: { $set: true },
        columns: { $splice: [[deleteIndex, 1]] },
      });
    }
    case ActionNames.ENABLE_RESET:
      return update(state, { skipReset: { $set: true } });
    default:
      return state;
  }
}
