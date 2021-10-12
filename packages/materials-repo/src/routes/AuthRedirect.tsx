import React, { memo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Login from '../pages/login';
import Register from '../pages/register';
import { useGlobalContext } from '../store';
import { isValidUserRoles } from '../utils/auth';

/**
 * todo 这里更适合统一处理指定url规则的重定向，matchRoutes，否则要在各页面内单独处理；
 * 若已登录，则跳转到主页，默认是 /dashboard ;
 * 若未登录，则展示公共页面，默认是登录页或落地页；
 */
export function AuthRedirect() {
  const { pathname } = useLocation();
  const {
    state: { auth },
  } = useGlobalContext();

  console.log(';;pps4 AuthRedirect, ', auth);

  // isAuthed 若本地存在localstorage时，进入登录页会直接跳转
  if (
    auth.isAuthenticated &&
    isValidUserRoles() &&
    ['/id/login', '/id/register'].includes(pathname)
  ) {
    // 若用户已认证身份登录，则不能再访问注册、登录页面
    return <Navigate to='/dashboard/basic' replace />;
  }

  return (
    <Routes>
      <Route path='register' element={<Register />} />
      <Route path='login' element={<Login />} />
    </Routes>
  );
}

// export default memo(AuthRedirect);
export default AuthRedirect;
