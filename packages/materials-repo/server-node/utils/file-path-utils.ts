import path from 'path';

export function removePathFirstSlashIfExists(path: string) {
  if (!path.includes('/')) {
    return path;
  }

  const pathArr = path.split('/');

  return pathArr.length === 2 ? pathArr[1] : pathArr.slice(1).join('/');
}

/** 计算url请求所对应的服务器上的绝对路径。
 * todo 一个repo对应一个文件夹，而不是一个用户一个文件夹
 */
export function repoRequestPathToAbsolutePath(
  rootPath: string,
  requestPath: string,
) {
  // 去掉末尾/
  if (requestPath.endsWith('/')) {
    // requestPath_ = requestPath.substr(0, requestPath.length - 1);
    requestPath = requestPath.slice(0, -1);
  }

  // 将类似 '/admin/ak/repo' 拆成4部分  ['', 'admin', 'ak', 'repo']
  const pathArr = requestPath.split('/');

  // 默认为repo根目录
  let resultAbsPath = path.resolve(rootPath, pathArr[2]);
  // let resultAbsPath = path.resolve(rootPath, 'ak');

  if (pathArr.length > 4) {
    resultAbsPath = path.resolve(rootPath, pathArr[2], ...pathArr.slice(4));
  }

  return resultAbsPath;
}

/** 从path中获取repoName */
export function getUserRepoNameFromPath(path) {
  if (!path.includes('/repo')) {
    return '';
  }

  const pathArr = path.split('/');
  return pathArr[3];
}
