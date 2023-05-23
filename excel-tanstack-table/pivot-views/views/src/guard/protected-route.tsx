import React from 'react';

import { useSelector } from 'react-redux';
import { createSearchParams, Navigate, useLocation } from 'react-router-dom';

import { getIsAuthorized } from '@datalking/pivot-store';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthorized = useSelector(getIsAuthorized);
  const location = useLocation();

  if (!isAuthorized) {
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