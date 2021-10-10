import { intersection } from 'lodash';

import allUserRoles from '../../config/userRoles';

export function isArrayWithLength(arr) {
  return Array.isArray(arr) && arr.length;
}

/**
 * 简单检查localStorage中是否包含有权限的用户，方便在本地配置和限制用户角色类型。
 * 注意验证密码身份的结果保存在globalState，还要考虑token是否过期，这些都需要额外实现。
 */
export function isValidUserRoles() {
  const curuser = JSON.parse(localStorage.getItem('curuser'));
  // console.log(';;ls-ValidUserRoles-curuser, ', curuser)

  const curUserRoles: string | string[] = curuser?.roles;

  if (!curUserRoles) return false;
  if (typeof curUserRoles === 'string') {
    return Object.keys(allUserRoles).includes(curUserRoles);
  }
  if (
    isArrayWithLength(curUserRoles) &&
    intersection(curUserRoles, Object.keys(allUserRoles)).length
  ) {
    return true;
  }

  return false;
}
