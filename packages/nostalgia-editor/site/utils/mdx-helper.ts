/** 从路径中提取名称，如a/b/cc.md => cc */
export function getCompNameFromPath(mdxPath) {
  const splitSlash = mdxPath.split('/');
  const splitDot = splitSlash[splitSlash.length - 1].split('.');
  return splitDot[0];
}

export function getCompRelativePath(mdxPath) {
  return mdxPath.replace('src/', '');
}
