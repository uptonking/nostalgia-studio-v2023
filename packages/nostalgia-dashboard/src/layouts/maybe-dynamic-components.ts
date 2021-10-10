import { lazy } from 'react';

/** 基于React.lazy动态导入react组件 */
export function tryToGetLazyImportedComp(curRoute: any) {
  let MaybeDynamicComp = curRoute.component;

  if (typeof curRoute.component === 'string') {
    const DynamicComp = lazy(
      () => import(`../pages/${curRoute.component}.tsx`),
      // 可以在生产环境下隐藏导入错误的页面
      // .catch(
      //   (err) => import(`./views/exception/DynamicImportErrorPage`),
      // ),
    );

    MaybeDynamicComp = DynamicComp;
  }

  return MaybeDynamicComp;
}
