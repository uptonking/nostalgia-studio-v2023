import { Outlet } from 'react-router-dom';

import { AppShell, Box } from '@datalking/pivot-ui';

import { CreateTableFormDrawer } from '../features/create-table-form';
import { Header } from '../features/header/header';
import { TableList } from '../features/table/table-list';

export const Root = () => {
  return (
    <AppShell padding={0}>
      <Box h='100vh' sx={{ overflow: 'hidden' }}>
        <Header />
        <TableList />
        <Outlet />
      </Box>

      <CreateTableFormDrawer />
    </AppShell>
  );
};

export default Root;
