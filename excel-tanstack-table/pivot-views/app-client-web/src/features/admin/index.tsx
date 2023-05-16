import React from 'react';

import { Route, Routes } from 'react-router-dom';

import Box from '@mui/material/Box';

import Dashboard from './Dashboard';
import Data from './Data';
import { AdminSidebarMenu } from './Menu';
import Orders from './Orders';
import { Settings } from './Settings';
import Subscriptions from './Subscriptions';
import Users from './Users';

/**
 * Intent: App console look and feel
 * - Sticky menu and footer
 * - data grid
 * - home
 * - active users
 * - recent activity
 * - recent errors
 */
export function Admin() {
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebarMenu />
      <Box
        style={{
          flexGrow: 1,
          margin: '1rem .5rem -2rem .5rem',
          display: 'flex',
        }}
      >
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='settings' element={<Settings />} />
          <Route path='data' element={<Data />} />
          <Route path='users' element={<Users />} />
          <Route path='orders' element={<Orders />} />
          <Route path='subscriptions' element={<Subscriptions />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Admin;
