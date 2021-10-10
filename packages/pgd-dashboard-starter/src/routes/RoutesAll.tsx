import React, { Fragment, memo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import routesConfig from '../../config/routes';
import FullLayout from '../layouts/FullLayout';
import { getAllowedRoutes } from '../utils/routes-helper';
import AuthRedirect from './AuthRedirect';
import PrivateRoutes from './RoutesPrivate';

// import routesConfig from '../../config/routes-test';

function RoutesAllWithAuth() {
  const location = useLocation();
  console.log(';;RoutesAll-cur-path, ', location.pathname);

  const allowedRoutes = getAllowedRoutes(routesConfig);
  // console.log(';;allowedRoutes, ', allowedRoutes);

  return (
    <Routes>
      <Route path='dashboard' element={<FullLayout routes={allowedRoutes} />}>
        <Route
          path='*'
          element={<PrivateRoutes allowedRoutes={allowedRoutes} />}
        />
      </Route>

      {/* 无需登录就可查看的公共页面，且不会出现在侧边菜单 */}
      <Route path='*' element={<AuthRedirect />} />
    </Routes>
  );
}

export default memo(RoutesAllWithAuth);
// export default RoutesAllWithAuth;
