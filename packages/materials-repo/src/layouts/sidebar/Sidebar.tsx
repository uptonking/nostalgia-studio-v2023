/* eslint-disable max-nested-callbacks */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link, useLocation } from 'react-router-dom';
import { Badge, Collapse, Nav } from 'reactstrap';

import type { RoutesConfigType } from '../../../config/routes';
import { SIDEBAR_VISIBLE_MODE } from '../../store/actions-constants';
import { useGlobalContext } from '../../store';
import ItemTags from './ItemTags';
import SidebarSpecialNoncollapsibleItem from './SidebarSpecialNoncollapsibleItem';
import { setSidebarVisibleMode } from '../../store/settings/actions';

type SidebarProps = {
  routes?: RoutesConfigType;
  pathPrefix?: string;

  [prop: string]: any;
};

/**
 * 全局侧边栏组件；
 * 最多支持3级菜单，直接使用ul/li实现，没有使用复杂组件和递归算法；
 * todo mini-sidebar显示首字母或首字符。
 */
export function Sidebar(props: SidebarProps) {
  const { routes, pathPrefix } = props;
  const {
    state: { settings },
    dispatch,
  } = useGlobalContext();

  // console.log(';;Sidebar-props, ', pathPrefix, props);

  const { pathname } = useLocation();

  const activeRoute = useCallback(
    (routeName) => {
      return pathname.indexOf(routeName) > -1 ? 'selected' : '';
    },
    [pathname],
  );

  // 管理当前处于打开状态的所有可折叠菜单项；初始状态所有子菜单都是折叠的
  const [openedMenuItems, setOpenedMenuItems] = useState<Set<string>>(
    new Set(),
  );
  /** 这里集中创建所有折叠菜单的事件处理函数；
   * 点击可折叠菜单时，并不触发url路由跳转，只折叠展开子菜单项 */
  const toggleCollapseMenuHandlers = useMemo(() => {
    const handlers = {};

    routes.forEach((route1, key) => {
      if (route1.routes && route1.routes.length && route1.name.trim()) {
        handlers[route1.path] = () =>
          setOpenedMenuItems((prev) =>
            prev.has(route1.path)
              ? new Set(Array.from(prev).filter((i) => i !== route1.path))
              : new Set(prev.add(route1.path)),
          );

        route1.routes.forEach((route2: any, key) => {
          if (route2.routes && route2.routes.length && route2.name.trim()) {
            handlers[route2.path] = () =>
              setOpenedMenuItems((prev) =>
                prev.has(route2.path)
                  ? new Set(Array.from(prev).filter((i) => i !== route2.path))
                  : new Set(prev.add(route2.path)),
              );
          }
        });
      }
    });

    return handlers;
  }, [routes]);

  /** To Expand SITE_LOGO With Sidebar-Menu on Hover */
  const expandLogo = useCallback(() => {
    if (settings.activeSidebarType === 'mini-sidebar') {
      // console.log(';;expandLogo');
      document.getElementById('logobg').classList.toggle('expand-logo');
    }
  }, [settings.activeSidebarType]);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /** 在小屏幕，当点击左侧菜单后，会修改路由url，还会显示侧边栏 */
  const showMobilemenu = useCallback(() => {
    if (window.innerWidth < 800) {
      if (settings.sidebarVisibleMode !== 'hidden') {
        dispatch(setSidebarVisibleMode('hidden'));
        return;
      }
      dispatch(setSidebarVisibleMode('auto'));
    }
  }, [dispatch, settings.sidebarVisibleMode]);

  const memoedResultJsx = useMemo(
    () => (
      <aside
        id='sidebarbg'
        className='left-sidebar'
        data-sidebarbg={settings.activeSidebarBg}
        onMouseEnter={expandLogo}
        onMouseLeave={expandLogo}
      >
        <div className='scroll-sidebar'>
          <PerfectScrollbar className='sidebar-nav'>
            <div className='sidebar-nav'>
              <Nav id='sidebarnav'>
                {routes
                  .filter((r) => r.path !== '/')
                  .map((route1: any, key) => {
                    // console.log(';;route1, ', route1);
                    if (
                      route1.redirect ||
                      route1.navlabel ||
                      route1.path.startsWith('http') ||
                      route1.hideInMenu
                    ) {
                      // /处理一级不可折叠的特殊菜单

                      return (
                        <SidebarSpecialNoncollapsibleItem
                          curRoute={route1}
                          key={key}
                          activeRouteClassName={activeRoute(route1.path)}
                          // activeSidebarType={settings.activeSidebarType}
                          isItemIconShown={true}
                        />
                      );
                    }

                    if (route1.collapse) {
                      // /处理一级可折叠菜单项，简单遍历创建所有多级子菜单

                      return (
                        <li
                          className={activeRoute(route1.path) + ' sidebar-item'}
                          key={key}
                        >
                          <span
                            data-toggle='collapse'
                            className='sidebar-link has-arrow'
                            aria-expanded={openedMenuItems.has(route1.path)}
                            onClick={toggleCollapseMenuHandlers[route1.path]}
                          >
                            <i className={route1.icon} />
                            <span className='hide-menu'>{route1.name}</span>
                          </span>

                          <Collapse isOpen={openedMenuItems.has(route1.path)}>
                            <ul className='first-level'>
                              {route1.routes.map((route2, key) => {
                                if (
                                  route2.redirect ||
                                  route2.navlabel ||
                                  route2.path.startsWith('http')
                                ) {
                                  // /处理二级不可折叠菜单

                                  return (
                                    <SidebarSpecialNoncollapsibleItem
                                      curRoute={route2}
                                      key={key}
                                      activeRouteClassName={activeRoute(
                                        route2.path,
                                      )}
                                      isItemIconShown={false}
                                    />
                                  );
                                }

                                if (route2.collapse) {
                                  // /处理二级可折叠菜单项

                                  return (
                                    <li
                                      className={
                                        activeRoute(route2.path) +
                                        ' sidebar-item'
                                      }
                                      key={key}
                                    >
                                      <span
                                        data-toggle='collapse'
                                        className='sidebar-link has-arrow'
                                        aria-expanded={openedMenuItems.has(
                                          route2.path,
                                        )}
                                        onClick={
                                          toggleCollapseMenuHandlers[
                                            route2.path
                                          ]
                                        }
                                      >
                                        {/* <i className={route2.icon} /> */}
                                        <span className='hide-menu'>
                                          {route2.name}
                                        </span>
                                      </span>
                                      <Collapse
                                        isOpen={openedMenuItems.has(
                                          route2.path,
                                        )}
                                      >
                                        <ul className='second-level'>
                                          {route2.routes.map((route3, key) => {
                                            // /处理三级菜单项，三级菜单项都不可折叠

                                            if (
                                              route3.redirect ||
                                              route3.navlabel ||
                                              route3.path.startsWith('http')
                                            ) {
                                              // / 三级特殊菜单

                                              return (
                                                <SidebarSpecialNoncollapsibleItem
                                                  curRoute={route3}
                                                  key={key}
                                                  activeRouteClassName={activeRoute(
                                                    route3.path,
                                                  )}
                                                  isItemIconShown={false}
                                                />
                                              );
                                            }

                                            // 普通带路由的三级子菜单
                                            return (
                                              <li
                                                className={
                                                  activeRoute(route3.path) +
                                                  ' sidebar-item'
                                                }
                                                key={key}
                                              >
                                                <Link
                                                  to={
                                                    pathPrefix
                                                      ? `${pathPrefix}/${route3.path}`
                                                      : route3.path
                                                  }
                                                  // activeClassName='active'
                                                  className='sidebar-link'
                                                >
                                                  {/* <i className={route3.icon} /> */}
                                                  <span className='hide-menu'>
                                                    {route3.name}
                                                  </span>
                                                  <ItemTags
                                                    tags={route3.tags}
                                                  />
                                                </Link>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </Collapse>
                                    </li>
                                  );
                                }

                                // 普通带路由的二级子菜单
                                return (
                                  <li
                                    onClick={scrollTop}
                                    className={
                                      activeRoute(route2.path) + ' sidebar-item'
                                    }
                                    key={key}
                                  >
                                    <Link
                                      to={
                                        pathPrefix
                                          ? `${pathPrefix}/${route2.path}`
                                          : route2.path
                                      }
                                      onClick={showMobilemenu}
                                      className='sidebar-link'
                                      // activeClassName='active'
                                    >
                                      {/* <i className={route2.icon} /> */}
                                      <span className='hide-menu'>
                                        {route2.name}
                                      </span>
                                      <ItemTags tags={route2.tags} />
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </Collapse>
                        </li>
                      );
                    }

                    // console.log(';;sidebar-link, ', pathPrefix,route1.path);
                    // 最后处理一级不可折叠的路由菜单项
                    return (
                      <li
                        onClick={scrollTop}
                        className={activeRoute(route1.path) + ' sidebar-item'}
                        key={key}
                      >
                        <Link
                          to={
                            pathPrefix
                              ? `${pathPrefix}/${route1.path}`
                              : route1.path
                          }
                          className={`sidebar-link${
                            activeRoute(route1.path) ? ' active' : ''
                          }`}
                          // activeClassName='active'
                          onClick={showMobilemenu}
                        >
                          <i className={route1.icon} />
                          <span className='hide-menu'>{route1.name}</span>
                          <ItemTags tags={route1.tags} />
                        </Link>
                      </li>
                    );
                  })}
              </Nav>
            </div>
          </PerfectScrollbar>
        </div>
      </aside>
    ),
    [
      activeRoute,
      expandLogo,
      openedMenuItems,
      pathPrefix,
      routes,
      scrollTop,
      settings.activeSidebarBg,
      showMobilemenu,
      toggleCollapseMenuHandlers,
    ],
  );

  return memoedResultJsx;
}

export default Sidebar;
