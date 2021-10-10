import { intersection } from 'lodash';

import { isArrayWithLength } from './auth';

/**
 * 遍历routes过滤掉没有许可的routes。
 * 没有配置access属性的默认可公开访问。
 */
export function getAllowedRoutes(routes) {
  // 当前登录用户所具有的权限，这里必须是数组
  let curUserRoles: string[] = JSON.parse(
    localStorage.getItem('curuser'),
  )?.roles;

  // 默认普通用户，用于测试
  if (!curUserRoles) curUserRoles = ['user'];

  return routes.filter(({ access }) => {
    if (!access) return true;

    const { requiredRoles } = access;
    // console.log(requiredRoles)

    if (!requiredRoles) return true;
    if (typeof requiredRoles === 'string') {
      return curUserRoles.includes(requiredRoles);
    }
    if (!isArrayWithLength(requiredRoles)) return true;
    // console.log(intersection(requiredRoles, roles))
    // 若配置的是数组，则检查当前用户的权限比较
    return intersection(curUserRoles, requiredRoles).length;
  });
}
