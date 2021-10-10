import * as React from 'react';
import { Fragment, useMemo, memo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { tryToGetLazyImportedComp } from '../layouts/maybe-dynamic-components';
import PageNotFound404 from '../pages/exception/404';
import { useGlobalContext } from '../store';
import { isValidUserRoles } from '../utils/auth';
import MarkdownEditor from '../views/repo/material-viewer/MarkdownEditor';

/**
 * 无需登录便可查看的资料库repo、资料小程序miniApp
 */
export function RoutesMiniApp({ routes }) {
  const location = useLocation();

  console.log(';;/RoutesMiniApp-pathname, ', location.pathname);

  const memoedResultRoutes = useMemo(
    () => (
      <Routes>
        {routes
          .filter((r) => r['path'] !== '/')
          .map((route1: any, key) => {
            if (
              route1.navlabel ||
              route1.path.startsWith('http') ||
              route1.hideInMenu
            ) {
              return null;
            }

            if (route1.collapse) {
              return route1.routes.map((route2: any, key2) => {
                if (route2.navlabel || route2.path.startsWith('http')) {
                  return null;
                }

                if (route2.collapse) {
                  return route2.routes.map((route3: any, key3) => {
                    if (route3.navlabel || route3.path.startsWith('http')) {
                      return null;
                    }

                    if (route3.redirect) {
                      return (
                        <Navigate to={route3.pathTo} replace={true} key={key} />
                      );
                    }

                    const MaybeDynamicComp3 = tryToGetLazyImportedComp(route3);

                    // 最长的三级路由
                    return (
                      <Route
                        path={route3.path}
                        // element={<route3.component />}
                        element={<MaybeDynamicComp3 />}
                        key={key3}
                      />
                    );
                  });
                }

                if (route2.redirect) {
                  return (
                    <Navigate to={route2.pathTo} replace={true} key={key} />
                  );
                }

                const MaybeDynamicComp2 = tryToGetLazyImportedComp(route2);

                // 二级路由
                return (
                  <Route
                    path={route2.path}
                    // element={<route2.component />}
                    element={<MaybeDynamicComp2 />}
                    key={key2}
                  />
                );
              });
            }

            if (route1.redirect) {
              return <Navigate to={route1.pathTo} replace={true} key={key} />;
            }

            // const MaybeDynamicComp1 = tryToGetLazyImportedComp(route1);

            // console.log(';;route1 , ', route1, MaybeDynamicComp1);

            // 最后处理一级路由
            return (
              <Route
                path={route1.path}
                // element={<route1.component />}
                element={<MarkdownEditor />}
                key={key}
              />
            );
          })}

        <Route path='*' element={<PageNotFound404 />} />
      </Routes>
    ),
    [routes],
  );

  return memoedResultRoutes;
}

export default memo(RoutesMiniApp);
// export default RoutesMiniApp;
