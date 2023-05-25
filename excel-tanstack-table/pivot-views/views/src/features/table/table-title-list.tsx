import React, { useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import { Emoji } from 'emoji-picker-react';
import { useSetAtom } from 'jotai';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { TableFactory } from '@datalking/pivot-core';
import {
  getCurrentTableId,
  getIsAuthorized,
  useGetTablesQuery,
} from '@datalking/pivot-store';
import {
  ActionIcon,
  Center,
  Flex,
  IconChevronDown,
  IconPlus,
  Loader,
  Menu,
  Tabs,
} from '@datalking/pivot-ui';

import { CurrentTableContext } from '../../context/current-table';
import { useAppSelector } from '../../hooks';
import { useCloseAllDrawers } from '../../hooks/use-close-all-drawers';
import {
  createTableFormDrawerOpened,
} from '../create-table-form/drawer-opened.atom';
import {
  UpdateTableFormDrawer,
} from '../update-table-form/update-table-form-drawer';
import { EmptyTableList } from './empty-table-list';
import { TableMenuDropdown } from './table-menu-dropdown';

const EMPTY_OBJECT = {};

export const TableTitleList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tableId } = useParams();

  const currentTableId = useAppSelector(getCurrentTableId);

  const { data, isLoading, isSuccess } = useGetTablesQuery(EMPTY_OBJECT);

  // console.log(';; fetchTbs ', isLoading, isSuccess, data)

  useEffect(() => {
    if (!tableId && location.pathname === '/') {
      if (currentTableId) {
        navigate(`/t/${currentTableId}`, { replace: true });
      } else if (data?.ids.length) {
        navigate(`/t/${data.ids.at(0)}`, { replace: true });
      }
    }
  }, [tableId, data?.ids, location.pathname, currentTableId, navigate]);

  const setOpened = useSetAtom(createTableFormDrawerOpened);
  const close = useCloseAllDrawers();

  if (isLoading && !currentTableId) {
    return (
      <Center w='100%' h='100%'>
        <Loader />
      </Center>
    );
  }

  if (!data?.ids.length && !currentTableId) {
    return <EmptyTableList />;
  }

  return (
    <Flex h={40}>
      <Center>
        <Tabs
          variant='default'
          display='flex'
          value={currentTableId}
          onTabChange={(value) => {
            if (value !== currentTableId) {
              navigate(`/t/${value}`);
            }
          }}
        >
          {Object.values(data?.entities ?? {})
            .filter(Boolean)
            .map((tbl) => (
              <Tabs.Tab
                key={tbl.id}
                value={tbl.id}
                p='xs'
                icon={<Emoji size={14} unified={tbl.emoji} />}
                rightSection={
                  tbl.id === currentTableId && (
                    <>
                      <Menu withinPortal width={200} shadow='xl'>
                        <Menu.Target>
                          <IconChevronDown />
                          {/* <ActionIcon size='xs'>
                          </ActionIcon> */}
                        </Menu.Target>

                        <Menu.Dropdown>
                          <TableMenuDropdown tableId={tbl.id} />
                        </Menu.Dropdown>
                      </Menu>
                      <CurrentTableContext.Provider
                        value={TableFactory.fromQuery(tbl)}
                      >
                        <UpdateTableFormDrawer />
                      </CurrentTableContext.Provider>
                    </>
                  )
                }
              >
                {tbl.name}
              </Tabs.Tab>
            ))}
        </Tabs>
        {Boolean(isSuccess && data.ids.length) && (
          <ActionIcon
            variant='subtle'
            onClick={(e) => {
              e.stopPropagation();
              unstable_batchedUpdates(() => {
                close();
                setOpened(true);
              });
            }}
          >
            <IconPlus size={14} />
          </ActionIcon>
        )}
      </Center>
    </Flex>
  );
};
