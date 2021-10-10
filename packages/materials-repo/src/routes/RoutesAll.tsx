import * as React from 'react';
import { Fragment, memo, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import routesConfig from '../../config/routes';
import routesAtlaskitConfig from '../../config/routes-repo-base';
import FullLayout from '../layouts/FullLayout';
import MiniAppLayout from '../layouts/MaterialsMiniAppLayout';
import MaterialsRepoLayout from '../layouts/MaterialsRepoLayout';
import { tryToGetLazyImportedComp } from '../layouts/maybe-dynamic-components';
import PageNotFound404 from '../pages/exception/404';
import QuickStartPage from '../pages/starter/quickstart';
import { useGlobalContext } from '../store';
import { getAllowedRoutes } from '../utils/routes-utils';
import { ForgotPassword, LandingPage } from '../views/auth';
import { RepoManager } from '../views/repo';
import MarkdownEditor from '../views/repo/material-viewer/MarkdownEditor';
import TextEditor from '../views/repo/material-viewer/TextEditor';
import ViewNotSupported from '../views/repo/material-viewer/ViewNotSupported';
import DocPageView from '../views/repo/mini-app/DocPageView';
import AuthRedirect from './AuthRedirect';
import RoutesMiniApp from './RoutesMiniApp';
import PrivateRoutes from './RoutesPrivate';
// import routesConfig from '../../config/routes-test';

/**
 * 本系统/平台的所有routes
 */
function RoutesAllWithAuth() {
  const location = useLocation();

  // todo 实现无需登录便可查看的资料库和小程序
  const {
    state: {
      user,
      miniApp: { miniAppOwner, miniAppName, miniAppRoutesConfig },
    },
  } = useGlobalContext();
  // console.log(';;RoutesAll-注意数据保存在user.user, ', miniAppName, user);

  // 系统/平台级顶层routes
  const dashboardAllowedRoutes = getAllowedRoutes(routesConfig);
  // console.log(';;allowedRoutes, ', allowedRoutes);

  /**
   * 是否要实现~~无需登录的版本~~，用于查看本地文件资料小程序pages，可以默认使用admin账户。
   */
  const memoedAllRoutes = useMemo(() => {
    console.log(';;RoutesAll-cur-path, ', location.pathname);

    return (
      // 通用的平台级或站点级dashboard视图
      <Routes>
        {/* <Route path='/' element={<LandingPage />} /> */}

        {/* ---- 注册和登录界面 ----  */}
        <Route path='id'>
          <Route path='*' element={<AuthRedirect />} />
        </Route>

        {/* ---- 当前用户工作台主页：置顶资料库+最近动态 ---- */}
        <Route
          path='dashboard'
          element={<FullLayout routes={dashboardAllowedRoutes} />}
        >
          <Route
            path='*'
            element={<PrivateRoutes allowedRoutes={dashboardAllowedRoutes} />}
          />
        </Route>

        {
          // 单个资料小程序的视图，一般为类似gitbook的多页面站点；无需登录便可查看

          miniAppOwner && miniAppName ? (
            <Route path='pages'>
              <Route
                path='/pages'
                element={
                  <QuickStartPage title='pages/  ;  all mini apps of all users' />
                }
              />

              <Route path=':miniAppOwner'>
                <Route
                  path='/pages/:miniAppOwner'
                  element={
                    <QuickStartPage title='pages/:miniAppOwner/  ;  all mini apps of a user' />
                  }
                />

                <Route path=':miniAppName'>
                  <Route
                    path='/pages/:miniAppOwner/:miniAppName'
                    element={
                      // <QuickStartPage title='pages/:user/:pagesName/  ;  文档简介+更新+讨论；也可直接跳转到某个app首页' />
                      <Navigate to='app' replace={true} />
                    }
                  />

                  {/* 这里是一个典型的资料小程序，小程序主页默认为/，其次是第一个配置项 */}
                  <Route
                    path='app'
                    element={
                      <MiniAppLayout
                        routes={miniAppRoutesConfig}
                        // pathPrefix={`pages/${user.user?.username}/${miniAppName}/app`}
                        // pathPrefix={`pages/${user.user?.username}/miniAppName`}
                        // pathPrefix={`app`}
                      />
                    }
                  >
                    <Route
                      path='/pages/:miniAppOwner/:miniAppName/app'
                      element={<DocPageView />}
                    />
                    <Route path='*' element={<DocPageView />} />
                  </Route>

                  <Route
                    path='discussion'
                    element={
                      <QuickStartPage title='pages/:miniAppOwner/:miniAppName/discussion 小程序讨论首页' />
                    }
                  />

                  {/* <Route
                      path='*'
                      element={
                        <PageNotFound404 title=':user/:repo/* ; 404 Not Found' />
                      }
                    /> */}
                </Route>
              </Route>
            </Route>
          ) : null
        }

        {
          // 单个仓库/资料库/网盘的视图；无需登录便可查看
          //  username一般在6位及以上，小于6位的如pages系统保留备用，如此设计可支持同名小程序

          // todo 改为repoOwner
          user['user'] ? (
            <Route
              path=':repoOwner'
              element={
                <MaterialsRepoLayout
                  // 这里传入routes和prefix只用于创建左侧边栏菜单链接
                  routes={routesAtlaskitConfig}
                  pathPrefix={`pages/${user.user?.username}/ak/app/`}
                />
              }
            >
              <Route
                path='/:repoOwner'
                element={
                  <QuickStartPage title=':repoOwner/ ;  all repos + pages of a user' />
                }
              />

              <Route path=':repo'>
                <Route
                  path='/:repoOwner/:repo'
                  element={
                    <QuickStartPage title=':repoOwner/:repo/ ; User Repo Index: repo commits + pages' />
                  }
                />

                <Route path='repo'>
                  {/* 默认显示文件管理器/网盘，而不是文档小程序；此时左侧边栏非必需 */}
                  <Route
                    path='/:repoOwner/:repo/repo'
                    element={<RepoManager />}
                  />
                  <Route path='*' element={<RepoManager />} />
                </Route>

                <Route
                  path='discussion'
                  element={<QuickStartPage title=':user/:repo/discussion' />}
                />
              </Route>
            </Route>
          ) : null
        }

        <Route path='edit'>
          <Route path='text' element={<TextEditor />} />
          <Route path='markdown' element={<MarkdownEditor />} />
          <Route
            path='page/markdown'
            element={<DocPageView readOnly={false} />}
          />
          <Route path='*' element={<ViewNotSupported />} />
        </Route>

        {/* 无需登录就可查看的公共页面，且不会出现在侧边菜单 */}
        <Route path='pwd' element={<ForgotPassword />} />
        <Route
          path='*'
          element={<LandingPage />}
          // element={<PageNotFound404 title='* ; 404 Not Found' />}
        />
      </Routes>
    );
  }, [
    dashboardAllowedRoutes,
    location.pathname,
    miniAppName,
    miniAppOwner,
    miniAppRoutesConfig,
    user,
  ]);

  return memoedAllRoutes;
}

// export default RoutesAllWithAuth;
export default memo(RoutesAllWithAuth);
