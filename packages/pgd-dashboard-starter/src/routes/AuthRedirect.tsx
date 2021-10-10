import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useGlobalContext } from '../store';
import { isValidUserRoles } from '../utils/auth';
import PublicRoutes from './RoutesPublic';

/**
 * todo 用户登录后，却无法查看落地页、关于页；
 * todo 这里更适合统一处理指定url规则的重定向，matchRoutes，否则要在各页面内单独处理；
 * 若已登录，则跳转到主页，默认是 /dashboard ;
 * 若未登录，则展示公共页面，默认是登录页或落地页；
 */
export function AuthRedirect() {
  const { pathname } = useLocation();
  const {
    state: { auth },
  } = useGlobalContext();

  // isAuthed 处理本地存在localstorage时进入/login会直接跳转的情况
  if (
    auth.isAuthenticated &&
    isValidUserRoles() &&
    ['/login', '/register'].includes(pathname)
  ) {
    // 若用户已认证身份登录，则不能再访问注册、登录页面
    return <Navigate to='/dashboard' replace />;
  }

  // 用户登录后仍能访问的公共页，如落地页、关于页
  return <PublicRoutes />;
}

export default memo(AuthRedirect);
// export default AuthRedirect;
