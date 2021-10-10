import React, { Fragment, memo } from 'react';
import { Route, Routes } from 'react-router-dom';

import Login from '../pages/login';
import Register from '../pages/register';
import { ForgotPassword, LandingPage } from '../views/auth';

/**
 * 这里的公共routes不是从配置文件读取，而是直接导入了react组件，可用于注册登录等公共页面；
 * routes.ts配置文件中也可以有无需权限且会出现在侧边菜单的公共routes，而这里的不会出现在侧边；
 */
function PublicRoutes() {
  return (
    <Routes>
      <Route path='register' element={<Register />} />
      <Route path='login' element={<Login />} />
      <Route path='pwd' element={<ForgotPassword />} />
      <Route path='*' element={<LandingPage />} />
    </Routes>
  );
}

export default memo(PublicRoutes);
// export default PublicRoutes;
