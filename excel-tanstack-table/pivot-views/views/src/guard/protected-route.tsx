import React from 'react';

import { createSearchParams, Navigate, useLocation } from 'react-router-dom';

import { getAuthStatus, getAuthToken } from '@datalking/pivot-store';
import { FullPageLoader } from '@datalking/pivot-ui';

import { useAppSelector } from '../hooks';

type ProtectedRouteProps = {
  children: React.ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  const authStatus = useAppSelector(getAuthStatus);
  const authToken = useAppSelector(getAuthToken);

  // console.log(
  //   ';; routeAuth ',
  //   location.pathname,
  //   authStatus,
  //   authToken?.slice(0, 5),
  // );

  if (authToken && (authStatus === 'pending' || authStatus === 'idle')) {
    return <FullPageLoader />;
  }

  if (!authToken) {
    return (
      <Navigate
        to={{
          pathname: '/login',
          search: `?${createSearchParams({ redirectUrl: location.pathname })}`,
        }}
        replace
      />
    );
  }

  return children;
};
