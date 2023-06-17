import {
  createTable,
  type Row,
  type RowData,
  type Table,
  type TableOptionsResolved,
} from '@tanstack/table-core';

export class State<TData extends RowData = Array<object>> {
  table: Table<TData>;
  content: Array<{ type: string; children: Row<TData>[] }>;

  constructor(options: any) {
    const { id, environment, renderer, ...options_ } = options;
    const resolvedOptions: TableOptionsResolved<TData> = {
      state: {}, // Dummy state
      onStateChange: options.onStateChange || (() => {}), // noop
      renderFallbackValue: null,
      ...options_,
    };

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
        //   setState(updater);
        //   options.onStateChange?.(updater);
        // },
      };
    });

    window['tb'] = this.table;
    // console.log(
    //   ';; tb-init ',
    //   // this.table.initialState,
    //   this.table.getState(),
    //   this.table,
    // );

    this.content = [{ type: 'table', children: this.table.getRowModel().rows }];
  }
}
