import React from 'react';

import { createSearchParams, Navigate, useLocation } from 'react-router-dom';

import { getAuthStatus, getIsAuthorized } from '@datalking/pivot-store';
import { FullPageLoader } from '@datalking/pivot-ui';

import { useAppSelector } from '../hooks';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthorized = useAppSelector(getIsAuthorized);
  const authStatus = useAppSelector(getAuthStatus);
  const location = useLocation();

  if (authStatus === 'pending') {
    return <FullPageLoader />;
  }

  if (!isAuthorized && authStatus === 'failure') {
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

  return <>{children}</>;
};
