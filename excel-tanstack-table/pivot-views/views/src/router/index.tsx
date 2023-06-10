import React from 'react';

import { type RouteObject } from 'react-router-dom';

import { ProtectedRoute } from '../guard/protected-route';
import { Login } from '../pages/login';
import { Members } from '../pages/members';
import { MyProfile } from '../pages/my-profile';
import { Record } from '../pages/record';
import { Register } from '../pages/register';
import { Root } from '../pages/root';
import { Table } from '../pages/table';

// import loadable from '@loadable/component';
// const Table = loadable(() => import('../pages/table'));
// const Root = loadable(() => import('../pages/root'));
// const Login = loadable(() => import('../pages/login'));
// const Register = loadable(() => import('../pages/register'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Root />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 't/:tableId/:viewId?',
        element: <Table />,
        children: [
          {
            path: 'r/:recordId',
            element: <Record />,
          },
        ],
      },
    ],
  },
  {
    path: '/members',
    element: (
      <ProtectedRoute>
        <Members />
      </ProtectedRoute>
    ),
  },
  {
    path: '/me/profile',
    element: (
      <ProtectedRoute>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
];
