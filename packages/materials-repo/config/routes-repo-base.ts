import Quickstart from '../src/pages/starter/quickstart';
// import type { RoutesConfigType } from './routes';

// todo: url path暂时需要手动修改与pages文件夹的路径保持同步，后期要自动生成路由配置对象
// 所有path不能以/开头，除了/自身这一个

/** 资料小程序url配置集合，Atlaskit编辑器相关；作为小程序页面和配置的通用结构
 */
// export const routesConfig:RoutesConfigType = [
export const routesConfig = [
  {
    // path: `${namePrefix}/renderer`,
    path: `renderer`,
    name: '最近文档',
    // icon: 'fa fa-tags',
    component: 'starter/quickstart',
  },
  {
    // path: `${namePrefix}/core-basic`,
    // path: `core-basic`,
    path: `basic`,
    name: '搜索',
    // icon: 'fa fa-home',
    component: 'about/routes-url-lists',
  },
  {
    collapse: true,
    // path: `${namePrefix}/core-dir`,
    path: `core-dir`,
    name: '文档类型',
    icon: 'fa fa-angle-right',
    component: 'about/routes-url-lists',
    access: {
      requiredRoles: ['admin', 'user'],
    },
    routes: [
      {
        // path: `${namePrefix}/core/labs`,
        path: `core/labs`,
        name: 'Labs',
        component: Quickstart,
      },
      {
        // path: `${namePrefix}/core/autoformatting`,
        path: `core/autoformatting`,
        name: 'Autoformatting',
        icon: 'fa fa-bars',
        component: Quickstart,
      },
      {
        // path: `${namePrefix}/core/annotations`,
        path: `core/annotations`,
        name: 'Annotations',
        component: 'about/routes-url-lists',
      },
    ],
  },
  {
    // path: `${namePrefix}/adf`,
    path: `adf`,
    name: '快速访问书签',
    // icon: 'fa fa-tags',
    // component: 'starter/quickstart',
    component: Quickstart,
    access: {
      requiredRoles: ['user', 'admin'],
    },
  },

  {
    // path: `${namePrefix}/renderer/email`,
    path: `renderer-email`,
    name: '最近删除',
    // icon: 'fa fa-tags',
    component: 'about/routes-url-lists',
  },

  {
    navlabel: true,
    name: '更多链接',
    // icon: 'fa fa-ellipsis-h',
  },
  {
    // path: `${namePrefix}/sitemap `,
    path: `/sitemap`,
    component: 'about/routes-url-lists',
    name: '本站链接 Sitemap',
    icon: 'fa fa-sitemap',
  },
];

export default routesConfig;
