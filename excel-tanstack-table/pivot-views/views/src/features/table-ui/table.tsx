import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import type { ISetPinnedFieldsCommandInput } from '@datalking/pivot-cqrs';
import {
  getTableSelectedRecordIds,
  setTableSelectedRecordIds,
  useSetPinnedFieldsMutation,
} from '@datalking/pivot-store';
import { Box, Table, useListState } from '@datalking/pivot-ui';
import type {
  ColumnDef,
  ColumnPinningState,
  OnChangeFn,
  Row,
} from '@tanstack/react-table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { ACTIONS_FIELD, SELECTION_ID } from '../../constants/field.constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useCurrentTable } from '../../hooks/use-current-table';
import { useCurrentView } from '../../hooks/use-current-view';
import { ActionsCell } from './actions-cell';
import { ActionsHeader } from './actions-header';
import { Cell } from './cell';
import { EmptyTable } from './empty-table';
import type { IProps, TData } from './interface';
import { SelectionCell } from './selection-cell';
import { SelectionHeader } from './selection-header';
import { tableStyles } from './styles';
import { Th } from './th';

const columnHelper = createColumnHelper<TData>();

const selection: ColumnDef<TData> = {
  enableResizing: false,
  id: SELECTION_ID,
  enablePinning: true,
  size: 40,
  header: (props) => <SelectionHeader table={props.table} />,
  cell: ({ row }) => <SelectionCell row={row} />,
};

const action = columnHelper.display({
  id: ACTIONS_FIELD,
  size: 50,
  header: (props) => <ActionsHeader table={props.table} />,
  cell: (props) => <ActionsCell row={props.row} table={props.table} />,
});

/**
 * ✨ powerful table support editing/filter/sort/group/pivot
 */
export const PivotableTable = ({ records }: IProps) => {
  const dispatch = useAppDispatch();
  const table = useCurrentTable();
  const view = useCurrentView();

  const schema = table.schema.toIdMap();
  const columnVisibility = useMemo(() => view.getVisibility(), [view]);
  const columnOrder = useMemo(() => table.getFieldsOrder(view), [table, view]);

  const pinned = useMemo(
    () => view.pinnedFields?.toJSON() ?? { left: [], right: [] },
    [view],
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [SELECTION_ID, ...pinned.left],
    right: pinned.right,
  });
  const [setPinnedFields] = useSetPinnedFieldsMutation();

  const onColumnPinningChange: OnChangeFn<ColumnPinningState> = useCallback(
    (state) => {
      setColumnPinning(state);
      const next = typeof state === 'function' ? state(columnPinning) : state;
      const { left: [, ...left] = [], right = [] } = next;
      const pinned: ISetPinnedFieldsCommandInput['pinnedFields'] = {
        left,
        right,
      };
      setPinnedFields({
        tableId: table.id.value,
        viewId: view.id.value,
        pinnedFields: pinned,
      });
    },
    [columnPinning, setPinnedFields, table.id.value, view.id.value],
  );

  const initialFields = useMemo(
    () => columnOrder.map((fieldId) => schema.get(fieldId)).filter(Boolean),
    [columnOrder, schema],
  );
  const [fields, handlers] = useListState(initialFields);

  useLayoutEffect(() => {
    handlers.setState(initialFields);
  }, [table]);

  const selectedRecordIds = useAppSelector((state) =>
    getTableSelectedRecordIds(state, table.id.value),
  );
  const [rowSelection, setRowSelection] = useState(selectedRecordIds);
  useEffect(() => {
    dispatch(
      setTableSelectedRecordIds({ tableId: table.id.value, ids: rowSelection }),
    );
  }, [rowSelection]);

  useEffect(() => {
    setRowSelection(selectedRecordIds);
  }, [selectedRecordIds]);

  const columns = useMemo(
    () => [
      selection,
      ...fields.map((f) =>
        columnHelper.accessor(f.id.value, {
          id: f.id.value,
          enableResizing: true,
          enablePinning: true,
          header: (props) => (
            <Th
              key={f.id.value}
              column={props.column}
              field={f}
              header={props.header}
              index={props.header.index}
            />
          ),
          size: view.getFieldWidth(f.id.value),
          cell: (props) => <Cell cell={props} field={f} />,
        }),
      ),
      action,
    ],
    [fields],
  );

  const data = useMemo(() => records.map((r) => r.valuesJSON), [records]);
  const tbl = useReactTable({
    data,
    meta: {
      tableId: table.id.value,
    },
    columns,
    state: {
      columnVisibility,
      columnOrder: [SELECTION_ID, ...columnOrder, ACTIONS_FIELD],
      columnPinning,
      rowSelection,
    },
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    enableRowSelection: true,
    enablePinning: true,
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange,
  });

  const { rows } = tbl.getRowModel();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35,
    overscan: 100,
  });

  const paddingTop =
    rowVirtualizer.getVirtualItems().length > 0
      ? rowVirtualizer.getVirtualItems()?.[0]?.start || 0
      : 0;
  const paddingBottom =
    rowVirtualizer.getVirtualItems().length > 0
      ? rowVirtualizer.getTotalSize() -
        (rowVirtualizer.getVirtualItems()?.[
          rowVirtualizer.getVirtualItems().length - 1
        ]?.end || 0)
      : 0;

  return (
    <Box ref={tableContainerRef} h='100%' sx={{ overflowY: 'scroll' }}>
      <Table
        withBorder
        highlightOnHover
        withColumnBorders
        verticalSpacing={5}
        w={tbl.getTotalSize()}
        sx={[
          tableStyles,
          (theme) => ({
            'thead tr th': {
              borderBottom: rows.length
                ? '1px sold ' + theme.colors.gray[2]
                : 0,
            },
          }),
        ]}
      >
        <thead>
          {tbl.getHeaderGroups().map((headerGroup, index) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <React.Fragment key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <Record
                key={row.id}
                row={row}
                checked={row.getIsSelected()}
                columnLength={columns.length}
                tableId={table.id.value}
              />
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </Table>
      {!rows.length && <EmptyTable />}
    </Box>
  );
};

const Record: React.FC<{
  row: Row<TData>;
  checked: boolean;
  columnLength: number;
  tableId: string;
}> = React.memo(({ row }) => {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => {
        navigate(`r/${row.id}`);
      }}
      key={row.id}
    >
      {row.getVisibleCells().map((cell) => (
        <React.Fragment key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </React.Fragment>
      ))}
    </tr>
  );
});
