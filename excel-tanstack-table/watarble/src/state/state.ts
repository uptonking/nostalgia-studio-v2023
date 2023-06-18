import {
  createTable,
  type Row,
  type RowData,
  type Table,
  type TableOptionsResolved,
} from '@tanstack/table-core';

import { EventEmitter } from '../utils/event-emitter';

export class State<TData extends RowData = Array<object>> extends EventEmitter {
  table: Table<TData>;
  content: Array<{ type: string; children: Row<TData>[] }>;
  store: Record<string, any>;

  constructor(options: any) {
    super();
    const { id, environment, renderer, ...options_ } = options;
    const resolvedOptions: TableOptionsResolved<TData> = {
      state: {}, // Dummy state
      onStateChange: options.onStateChange || (() => {}), // noop
      renderFallbackValue: null,
      ...options_,
    };

    this.store = {};

    // console.log(';; resolvedOptions', resolvedOptions);
    this.table = createTable(resolvedOptions);
    this.table.setOptions((prev) => {
      return {
        ...prev,
        ...options_,
        state: {
          ...this.table.initialState,
          ...options_.state,
        },
        // onStateChange: (updater) => {
        //   // setState(updater);
        //   console.log(';; onStateChange ');
        //   options.onStateChange?.(updater);
        //   this.emit('MODEL_UPDATE');
        // },
      };
    });

    window['tbl'] = this.table;
    // console.log(
    //   ';; tb-init ',
    //   // this.table.initialState,
    //   this.table.getState(),
    //   this.table,
    // );

    this.content = [{ type: 'table', children: this.table.getRowModel().rows }];
  }

  dispatch(actions = {}) {
    this.emit('MODEL_UPDATE');
  }

  /** compute derived state from model data */
  deriveModelChange() {
    this.content = [{ type: 'table', children: this.table.getRowModel().rows }];
  }
}
