import classNames from 'classnames';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import LoadingSpinner from '../components/feedback/loading-spinner';
import { useGlobalContext } from '../store/global-context';
import {
  setSidebarType,
  setSidebarVisibleMode,
} from '../store/settings/actions';
import { isValidUserRoles } from '../utils/auth';
import RoutingPagesErrorBoundary from '../views/exception/RoutingPagesErrorBoundary';
import RepoSidebar from '../views/repo/RepoSidebar';
import Footer from './footer';
import Header from './header';
import SetttingsCustomizer from './settings-customizer';
import { Sidebar } from './sidebar';

/**
 * 整个App的整体布局组件，左中右分别是sidebar、page-contents、settings-side-panel。
 */
export function MaterialsRepoLayout(props) {
  const { routes, pathPrefix } = props;

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const {
    state: { settings, auth },
    dispatch,
  } = useGlobalContext();

  // console.log(';;pps4 LeftCenterRightLayout, ', auth);

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    /**
     * 当global store中样式布局相关属性值变化时，会更新本组件最外层data-*的值；
     * 大多数data-*会通过state直接更新，这里只处理需要转换的情况；
     * 因为整体布局css大量依赖data-*，所以要更新用到过的data-属性值，没用到的可以不用更新；
     * 若修改了这里的width宽度值，则需要再修改.scss中相关选择器样式才能生效；
     */
    const updateDimensions = () => {
      const mainWrapperEl = document.getElementById('main-wrapper');
      if (!mainWrapperEl) {
        // 在小屏幕首次渲染时，初始值full修改为mini-sidebar
        // mini-sidebar本来在小屏幕上就是隐藏的，相当于overlay的效果，不需要额外设置
        if (width < 1170) {
          dispatch(setSidebarType('mini-sidebar'));
          return;
        }
      }

      setWidth(window.innerWidth);

      // console.log(
      //   ';;sidebar-type-mode, ',
      //   settings.activeSidebarType,
      //   settings.sidebarVisibleMode,
      // );
      // 侧边栏初始默认值是full；
      // 默认是响应式侧边栏，full能自动修改为mini，mini能自动修改为full
      switch (settings.activeSidebarType) {
        case 'full':
        case 'iconbar': {
          if (width >= 1170 && settings.sidebarVisibleMode === 'mini2full') {
            // full在普通桌面端会自动还原到auto响应式
            dispatch(setSidebarVisibleMode('auto'));
          }

          if (width < 1170) {
            if (
              settings.sidebarVisibleMode === 'auto'
              // ||
              // settings.sidebarVisibleMode === 'full2mini'
            ) {
              dispatch(setSidebarType('mini-sidebar'));
            }

            if (width < 767) {
              dispatch(setSidebarVisibleMode('auto'));
            }
          }

          break;
        }

        case 'mini-sidebar': {
          if (width >= 1170) {
            if (settings.sidebarVisibleMode === 'auto') {
              dispatch(setSidebarType('full'));
            }

            if (settings.sidebarVisibleMode === 'mini2full') {
              // 由mini自动还原full
              dispatch(setSidebarType('full'));
              dispatch(setSidebarVisibleMode('auto'));
              return;
            }
            // 对于full2mini，会一直保持mini
          }
          if (width < 767) {
            // if (settings.sidebarVisibleMode === 'mini2full') {
            // dispatch(setSidebarVisibleMode('auto'));
            // }
          }

          break;
        }
        case 'overlay': {
          break;
        }
        default:
      }

      // 在小屏幕，统一还原mode
      if (
        // window.innerWidth < 767 &&
        width < 767 &&
        settings.activeSidebarType !== 'overlay' &&
        settings.sidebarVisibleMode !== 'visible'
      ) {
        dispatch(setSidebarVisibleMode('auto'));
      }

      // /end updateDimensions()
    };

    if (document.readyState === 'complete') {
      updateDimensions();
    }

    window.addEventListener('load', updateDimensions);
    window.addEventListener('resize', updateDimensions);

    return () => {
      // isMounted = false;
      window.removeEventListener('load', updateDimensions);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [
    dispatch,
    settings.activeSidePanelType,
    settings.activeSidebarType,
    settings.sidebarVisibleMode,
    width,
  ]);

  // 整个App最外层div，id是main-wrapper
  const memoedResultJsx = useMemo(
    () => (
      <div
        id='main-wrapper'
        data-sidebartype={settings.activeSidebarType}
        data-sidebar-position={settings.activeSidebarPos}
        dir={settings.activeDir}
        data-side-panel-type={settings.activeSidePanelType}
        data-side-panel-position={settings.activeSidePanelPos}
        data-theme={settings.activeTheme}
        data-header-position={settings.activeHeaderPos}
        data-layout={settings.activeThemeLayout}
        data-boxed-layout={settings.activeLayout}
        className={classNames({
          'show-sidebar':
            (settings.activeSidebarType === 'overlay' ||
              settings.activeSidebarType === 'mini-sidebar') &&
            settings.sidebarVisibleMode === 'visible',
        })}
      >
        <Header />

        <RepoSidebar {...props} routes={routes} pathPrefix={pathPrefix} />

        {/* 基于react-router在不同url展示不同的页面组件 */}
        <div
          className={`page-wrapper d-block ${
            settings.activeSidePanelType === 'dock' &&
            !settings.isSidePanelShown
              ? 'mr-0'
              : ''
          }`}
        >
          <div className='page-content container-fluid'>
            <RoutingPagesErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Outlet />
              </Suspense>
            </RoutingPagesErrorBoundary>
          </div>
          {/* <Footer /> */}
        </div>

        {/* 右侧浮动配置面板 */}
        <SetttingsCustomizer />
      </div>
    ),
    [
      pathPrefix,
      props,
      routes,
      settings.activeDir,
      settings.activeHeaderPos,
      settings.activeLayout,
      settings.activeSidePanelPos,
      settings.activeSidePanelType,
      settings.activeSidebarPos,
      settings.activeSidebarType,
      settings.activeTheme,
      settings.activeThemeLayout,
      settings.isSidePanelShown,
      settings.sidebarVisibleMode,
    ],
  );

  if (!auth.isAuthenticated || !isValidUserRoles()) {
    // 若未登录，则不可查看内容，跳转到登录页
    return <Navigate to='/id/login' replace />;
    // navigate('/id/login', { replace: true });
  }
  // if (['/dashboard', '/dashboard/'].includes(pathname)) {
  // console.log(';;FullLayout, redirect /dashboard to /dashboard/basic');
  // return <Navigate to='/dashboard/basic' replace />;
  // navigate('/dashboard/basic', { replace: true });
  // }

  return memoedResultJsx;
}

export default MaterialsRepoLayout;
