import {
  createTable,
  functionalUpdate,
  type Row,
  type RowData,
  type Table,
  type TableOptionsResolved,
} from '@tanstack/table-core';

import { type Command } from '../../types';
import { UiPlugin, type UiPluginConfig } from '../plugin-ui';

/**
 * todo derive table data from core-plugin-sheet
 */
export class TablePlugin<TData extends RowData = object> extends UiPlugin {
  static pluginKey = 'WTBL_TABLE';

  static getters = [
    'getTableRowModel',
    'getTableHeaderGroups',
    'getTotalSize',
    'getColumnById',
    'getTable',
    'getSortingState',
  ] as const;

  private table: Table<TData>;
  private tableOptions: TableOptionsResolved<TData>;

  constructor(config: UiPluginConfig & { table: TableOptionsResolved<TData> }) {
    super(config);
    this.tableOptions = config.table;
    // console.log(';; tblOpts ', this.tableOptions);

    const resolvedOptions: TableOptionsResolved<TData> = {
      state: {},
      onStateChange: this.tableOptions.onStateChange || (() => {}), // noop
      renderFallbackValue: null,
      ...this.tableOptions,
    };
    // console.log(';; resolvedOptions', resolvedOptions);
    this.table = createTable(resolvedOptions);
    this.table.setOptions((prev) => ({
      ...prev,
      ...this.tableOptions,
      state: {
        ...this.table.initialState,
        ...this.tableOptions.state,
      },
      // onStateChange: (updater) => {
      //   // setState(updater);
      //   this.tableState = functionalUpdate(updater, this.tableState);
      //   console.log(';; onStateChange ', this.tableState);
      //   this.tableOptions.onStateChange?.(updater);
      // },
    }));
    window['tbl'] = this.table;
    // console.log(
    //   ';; tb-init ',
    //   this.table.getState(),
    //   this.table,
    // );
  }

  handle(cmd: Command) {
    switch (cmd.type) {
      case 'UPDATE_TABLE_STATE':
        this.mergeTableState(cmd.tableState);
        break;
    }
  }

  private mergeTableState(tableState) {
    // console.log(';; beforeMerge ', this.table.getState().sorting, tableState);

    this.table.setOptions((prev) => {
      return {
        ...prev,
        ...this.tableOptions,
        state: {
          ...this.table.initialState,
          ...this.tableOptions.state,
          ...tableState,
        },
        // onStateChange: (updater) => {
        //   // setState(updater);
        //   this.tableState = functionalUpdate(updater, this.table.options.state);
        //   console.log(';; onStateChange-m ', this.tableState);
        //   this.tableOptions.onStateChange?.(updater);
        //   // this.emit('MODEL_UPDATE');z
        // },
      };
    });

    // console.log(';; afterMerge ', this.table.getState().sorting);
  }

  getSortingState() {
    return this.table.getState().sorting;
  }

  /**
   * @internal add getters instead of using this
   */
  getTable() {
    return this.table;
  }

  getTotalSize() {
    return this.table.getTotalSize();
  }

  getTableRowModel() {
    return [{ type: 'table', children: this.table.getRowModel().rows }];
  }

  getTableHeaderGroups() {
    return this.table.getHeaderGroups();
  }

  getColumnById(id) {
    return this.table.getColumn(id);
  }
}
