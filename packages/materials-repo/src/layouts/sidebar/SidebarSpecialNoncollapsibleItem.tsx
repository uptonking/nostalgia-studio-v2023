import * as React from 'react';
import { NavLink } from 'reactstrap';

import { ItemTags } from './ItemTags';

/**
 * 处理几种特殊的不可折叠的菜单，包括
 * - redirect的route不显示；
 * - navlabel只显示文字，不支持跳转；
 * - 外部链接，使用a；
 */
export function SidebarSpecialNoncollapsibleItem(props) {
  const { curRoute, activeRouteClassName, isItemIconShown } = props;

  if (curRoute.redirect || curRoute.hideInMenu) {
    return null;
  }

  // 只显示文字，不支持点击跳转
  if (curRoute.navlabel) {
    return (
      <li className='sidebar-item text-muted'>
        <span className='sidebar-link navlabel-item'>
          {isItemIconShown && (
            <i className={`navlabel-icon ${curRoute.icon}`} />
          )}
          <span className='hide-menu'>{curRoute.name}</span>
          <ItemTags tags={curRoute.tags} />
        </span>
      </li>
    );
  }

  // 处理外部链接，会跳转到新页面
  if (curRoute.path.startsWith('http')) {
    return (
      <li
        // onClick={scrollTop}
        className={activeRouteClassName + ' sidebar-item'}
      >
        <NavLink href={curRoute.path} target='_blank' className='sidebar-link'>
          <i className={curRoute.icon || 'fa fa-external-link'} />
          <span className='hide-menu'>{curRoute.name}</span>
          <ItemTags tags={curRoute.tags} />
        </NavLink>
      </li>
    );
  }

  return null;
}

export default SidebarSpecialNoncollapsibleItem;
