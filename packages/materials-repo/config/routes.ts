import Quickstart from '../src/pages/starter/quickstart';
import Starter from '../src/views/dashboard-starter';

// 注意：每条合法的要显示在左侧边栏的路由项必须存在唯一的path

/** 最顶层的url配置集合，类似平台级或站点级的dashboard，这里只使用一次 */
export const routesConfig = [
  {
    path: 'basic',
    name: '主页',
    icon: 'fa fa-home',
    // 默认主页是Workbench，展示置顶资料库和最近动态
    component: 'index',
  },
  {
    collapse: true,
    path: 'libraries',
    name: '知识库',
    icon: 'fa fa-angle-right',
    component: Starter,
    access: {
      requiredRoles: ['admin'],
    },

    routes: [
      {
        path: 'list/basic',
        name: 'Atlassian Editor',
        // icon: 'fa fa-bars',
        component: Quickstart,
      },
      {
        path: 'list/card',
        name: 'ProseMirror',
        icon: 'fa fa-bars',
        component: Starter,
      },
      {
        path: 'list/search',
        name: '文本编辑器相关资料',
        // icon: 'fa fa-bars',
        component: 'about/routes-url-lists',
      },
    ],
  },
  {
    path: 'management',
    name: '知识管理/笔记/pages',
    icon: 'fa fa-clone', // compass, gavel
    component: 'starter/quickstart',
    access: {
      requiredRoles: ['user', 'admin'],
    },
  },
  {
    path: 'bookmarks',
    name: '收藏夹/书签',
    icon: 'fa fa-tags',
    component: 'starter/quickstart',
    access: {
      requiredRoles: ['user', 'admin'],
    },
  },
  {
    path: 'sharing',
    name: '协作/分享',
    icon: 'fa fa-users',
    component: 'about/routes-url-lists',
    access: {
      requiredRoles: ['user', 'admin'],
    },
  },
  {
    path: 'trash',
    name: '回收站',
    icon: 'fa fa-users',
    component: 'starter/quickstart',
    access: {
      requiredRoles: ['user', 'admin'],
    },
  },

  // 不配置name，就不会在侧边栏菜单中显示，但仍可在网页中访问
  // {
  //   path: '*',
  //   component: 'exception/404',
  // },

  {
    navlabel: true,
    name: '更多参考资料',
    // icon: 'fa fa-ellipsis-h',
  },
  {
    path: 'sitemap',
    component: 'about/routes-url-lists',
    name: '本站链接 Sitemap',
    icon: 'fa fa-link',
  },

  // 支持配置外部链接，path必须以http开头
  {
    path: 'https://www.yuque.com/dashboard/explore/recommend',
    name: '外部链接 - 语雀',
    tags: ['已废弃'],
    // icon: 'fa fa-share-square-o',
    // component: Starter,
    // hideInMenu: true,
  },
  {
    path: 'https://www.feishu.cn/product/wiki',
    name: '外部链接 - 飞书知识库',
    // icon: 'fa fa-share-square-o',
    // component: Starter,
    // hideInMenu: true,
  },
  {
    path: 'https://www.notion.so/Notion-Template-Gallery-181e961aeb5c4ee6915307c0dfd5156d',
    name: 'Notion Template Gallery',
    tags: ['热'],
    hideInMenu: true,
  },
  {
    path: 'https://www.atlassian.com/software/confluence',
    name: 'Atlassian Confluence',
    tags: ['热'],
  },

  // 下面配置重定向页面

  // 默认/会显示/dashboard页面
  { path: '/', pathTo: '/dashboard', name: 'Dashboard', redirect: true },
];

export type RoutesConfigType = typeof routesConfig;

// export default lazyImportComponents(routesConfig);
export default routesConfig;
