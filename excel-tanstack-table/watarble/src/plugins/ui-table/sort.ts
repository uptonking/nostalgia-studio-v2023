import { range } from 'lodash';

import {
  type Column,
  type Row,
  type RowData,
  type Table,
} from '@tanstack/table-core';

import {
  type CellPosition,
  type CellValueType,
  type Command,
  type CommandResult,
  type HeaderIndex,
  type LocalCommand,
  type Position,
  type SortDirection,
  type SortOptions,
  type UID,
  type UpdateCellCommand,
  type Zone,
} from '../../types';
import { CommandResults } from '../../utils/command';
import { CellValueDataTypes } from '../../utils/constants';
import { UIPlugin } from '../plugin-ui';

export interface ColumnSort {
  id: string;
  desc: boolean;
}

export type SortingState = ColumnSort[];

type CellWithIndex = { index: number; type: CellValueType; value: any };

export class SortPlugin extends UIPlugin {
  static getters = ['getSorting'] as const;

  sorting: SortingState;

  allowDispatch(cmd: LocalCommand): CommandResult | CommandResult[] {
    // switch (cmd.type) {
    //   case "SORT_CELLS":
    //     if (!isInside(cmd.col, cmd.row, cmd.zone)) {
    //       throw new Error(_lt("The anchor must be part of the provided zone"));
    //     }
    //     return this.checkValidations(cmd, this.checkMerge, this.checkMergeSizes);
    // }
    return CommandResults.Success;
  }

  handle(cmd: Command) {
    switch (cmd.type) {
      case 'TOGGLE_COLUMN_SORTING': {
        const column = this.getters.getColumnById(cmd.column);
        const canSort = column.getCanSort();
        if (!canSort) break;

        this.toggleSorting(column);
        this.dispatch('UPDATE_TABLE_STATE', {
          tableState: { sorting: this.sorting },
        });
        break;
      }
      case 'UPDATE_COLUMN_SORTING': {
        this.setSorting(cmd.sorting);
        this.dispatch('UPDATE_TABLE_STATE', {
          tableState: { sorting: this.sorting },
        });
        break;
      }
      case 'SORT_CELLS':
        this.sortZone(
          cmd.sheetId,
          cmd,
          cmd.zone,
          cmd.sortDirection,
          cmd.sortOptions || {},
        );
        break;
    }
  }

  private toggleSorting(column: Column<object, unknown>) {
    const nextSortingOrder = column.getNextSortingOrder();

    const isNextDesc = nextSortingOrder === 'desc';
    let newSorting: SortingState = [];

    const sortAction: 'add' | 'remove' | 'toggle' | 'replace' = 'toggle';

    if (sortAction === 'toggle') {
      newSorting = [
        {
          id: column.id,
          desc: isNextDesc,
        },
      ];
    }

    this.setSorting(newSorting);
  }

  getSorting() {
    return this.sorting;
  }

  private setSorting(sorting: SortingState) {
    this.sorting = sorting;
  }

  private sortZone(
    sheetId: UID,
    anchor: Position,
    zone: Zone,
    sortDirection: SortDirection,
    options: SortOptions,
  ) {
    const [stepX, stepY] = this.mainCellsSteps(sheetId, zone);
    // const sortingCol: HeaderIndex = this.getters.getMainCellPosition({
    //   sheetId,
    //   col: anchor.col,
    //   row: anchor.row,
    // }).col; // fetch anchor
    const sortingCol = 5;
    const sortZone = { ...zone };
    // Update in case of merges in the zone
    let cellPositions = this.mainCells(sheetId, zone);

    // if (!options.sortHeaders && this.hasHeader(sheetId, cellPositions)) {
    //   sortZone.top += stepY;
    // }
    cellPositions = this.mainCells(sheetId, sortZone);

    const sortingCells = cellPositions[sortingCol - sortZone.left];
    // const sortedIndexOfSortTypeCells = sortCells(
    //   sortingCells.map((position) => this.getters.getEvaluatedCell(position)),
    //   sortDirection,
    //   Boolean(options.emptyCellAsZero),
    // );
    // const sortedIndex: number[] = sortedIndexOfSortTypeCells.map(
    //   (x) => x.index,
    // );
    const sortedIndex = [1, 2];

    const [width, height]: [number, number] = [
      cellPositions.length,
      cellPositions[0].length,
    ];

    const updateCellCommands: Omit<UpdateCellCommand, 'type'>[] = [];
    for (let c: HeaderIndex = 0; c < width; c++) {
      for (let r: HeaderIndex = 0; r < height; r++) {
        const { col, row, sheetId } = cellPositions[c][sortedIndex[r]];
        const cell = this.getters.getCell({ sheetId, col, row });
        const newCol: HeaderIndex = sortZone.left + c * stepX;
        const newRow: HeaderIndex = sortZone.top + r * stepY;
        const newCellValues: Omit<UpdateCellCommand, 'type'> = {
          sheetId: sheetId,
          col: newCol,
          row: newRow,
          content: '',
        };
        if (cell) {
          // let content: string = cell.content;
          // if (cell.isFormula) {
          //   const position = this.getters.getCellPosition(cell.id);
          //   const offsetY = newRow - position.row;
          //   // we only have a vertical offset
          //   const ranges = this.getters.createAdaptedRanges(
          //     cell.dependencies,
          //     0,
          //     offsetY,
          //     sheetId,
          //   );
          //   content = this.getters.buildFormulaContent(sheetId, cell, ranges);
          // }
          // newCellValues.style = cell.style;
          // newCellValues.content = content;
          // newCellValues.format = cell.format;
        }
        updateCellCommands.push(newCellValues);
      }
      for (const cmd of updateCellCommands) {
        this.dispatch('UPDATE_CELL', cmd);
      }
    }
  }

  /**
   * Return the distances between main merge cells in the zone.
   * (1 if there are no merges).
   * Note: it is assumed all merges are the same in the zone.
   */
  private mainCellsSteps(sheetId: UID, zone: Zone): [number, number] {
    // const merge = this.getters.getMerge({ sheetId, col: zone.left, row: zone.top });
    // const stepX = merge ? merge.right - merge.left + 1 : 1;
    // const stepY = merge ? merge.bottom - merge.top + 1 : 1;
    // return [stepX, stepY];
    return [1, 1];
  }

  /**
   * Return a 2D array of cells in the zone (main merge cells if there are merges)
   */
  private mainCells(sheetId: UID, zone: Zone): CellPosition[][] {
    const [stepX, stepY] = this.mainCellsSteps(sheetId, zone);
    const cells: CellPosition[][] = [];
    const cols = range(zone.left, zone.right + 1, stepX);
    const rows = range(zone.top, zone.bottom + 1, stepY);
    for (const col of cols) {
      const colCells: CellPosition[] = [];
      cells.push(colCells);
      for (const row of rows) {
        colCells.push({ sheetId, col, row });
      }
    }
    return cells;
  }
}

export function sortCells(
  // cells: EvaluatedCell[],
  cells: any[],
  sortDirection: SortDirection,
  emptyCellAsZero: boolean,
): CellWithIndex[] {
  const cellsWithIndex: CellWithIndex[] = cells.map((cell, index) => ({
    index,
    type: cell.type,
    value: cell.value,
  }));
  let emptyCells: CellWithIndex[] = cellsWithIndex.filter(
    (x) => x.type === CellValueDataTypes.Empty,
  );
  const nonEmptyCells: CellWithIndex[] = cellsWithIndex.filter(
    (x) => x.type !== CellValueDataTypes.Empty,
  );
  if (emptyCellAsZero) {
    nonEmptyCells.push(
      ...emptyCells.map((emptyCell) => ({
        ...emptyCell,
        type: CellValueDataTypes.Number,
        value: 0,
      })),
    );
    emptyCells = [];
  }

  const inverse = sortDirection === 'desc' ? -1 : 1;

  return nonEmptyCells
    .sort((left, right) => {
      let typeOrder =
        Object.values(CellValueDataTypes).indexOf(left.type) -
        Object.values(CellValueDataTypes).indexOf(right.type);
      if (typeOrder === 0) {
        if (
          left.type === CellValueDataTypes.Text ||
          left.type === CellValueDataTypes.Error
        ) {
          typeOrder = left.value.localeCompare(right.value);
        } else typeOrder = left.value - right.value;
      }
      return inverse * typeOrder;
    })
    .concat(emptyCells);
}
