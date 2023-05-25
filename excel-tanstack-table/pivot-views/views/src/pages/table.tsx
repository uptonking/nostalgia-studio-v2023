import React, { useEffect, useLayoutEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { useSetAtom } from 'jotai';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { type IQueryTable, TableFactory } from '@datalking/pivot-core';
import {
  getIsAuthorized,
  resetCurrentTableId,
  resetCurrentViewId,
  setCurrentTableId,
  setCurrentViewId,
  useGetTableQuery,
} from '@datalking/pivot-store';
import {
  Alert,
  Box,
  Container,
  IconAlertCircle,
  ModalsProvider,
  useEgoUITheme,
  useHotkeys,
} from '@datalking/pivot-ui';

import { CurrentTableContext } from '../context/current-table';
import { CurrentViewContext } from '../context/current-view';
import {
  CreateRecordFormDrawer,
} from '../features/create-record-form/create-record-form-drawer';
import {
  createRecordFormDrawerOpened,
} from '../features/create-record-form/drawer-opened.atom';
import { TableLoading } from '../features/loading';
import {
  RecordSelectionDialog,
} from '../features/record-selection/record-selection-dialog';
import { TableToolbar } from '../features/table/table-toolbar';
import { ViewDisplay } from '../features/table/view-display';
import { ViewsListDrawer } from '../features/views/views-list-drawer';
import { useAppDispatch, useAppSelector } from '../hooks';
import { modals } from '../modals';

export const Table = () => {
  const { tableId, viewId } = useParams();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector(getIsAuthorized);
  const theme = useEgoUITheme();

  const { data, isUninitialized,isSuccess, isLoading, isError, error } = useGetTableQuery({
    id: tableId!,
  },
    {
      skip: !isAuthorized
    }
  );


  const setOpened = useSetAtom(createRecordFormDrawerOpened);

  useHotkeys([['r', () => setOpened(true)]]);

  useEffect(() => {
    unstable_batchedUpdates(() => {
      dispatch(setCurrentTableId(tableId!));
      dispatch(setCurrentViewId(viewId || undefined));
    });
  }, [tableId, viewId]);

  useLayoutEffect(() => {
    if (isSuccess && !data) {
      unstable_batchedUpdates(() => {
        dispatch(resetCurrentTableId());
        dispatch(resetCurrentViewId());
      });
    }
  }, []);

  if (isLoading && tableId) {
    return <TableLoading />;
  }

  if (isError) {
    return (
      <Container>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title='Oops! Get Table Error!'
          mt='lg'
          color='red'
        >
          {error['message']}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    dispatch(resetCurrentTableId());
    navigate('/', { replace: true });
    return null;
  }

  const table = TableFactory.fromQuery(data as IQueryTable);
  const view = table.mustGetView(viewId);

  return (
    <CurrentTableContext.Provider value={table}>
      <CurrentViewContext.Provider value={view}>
        <ModalsProvider modals={modals as any}>
          <Box h='calc(100% - 90px)'>
            <TableToolbar />
            <Box
              w='100%'
              h='calc(100% - 40px)'
              bg={theme.white}
              sx={{ flex: '1 1 auto' }}
            >
              <ViewDisplay />
            </Box>

            <CreateRecordFormDrawer />
            <Outlet />
            <ViewsListDrawer />

            <RecordSelectionDialog />
          </Box>
        </ModalsProvider>
      </CurrentViewContext.Provider>
    </CurrentTableContext.Provider>
  );
};

export default Table;
