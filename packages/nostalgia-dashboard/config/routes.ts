import Quickstart from '../src/pages/starter/quickstart-minimal';
import Starter from '../src/views/dashboard-starter';

// todo: url path暂时需要手动修改与pages文件夹的路径保持同步，方便后期自动生成路由配置对象
// todo: 修改component为路径字符串，方便序列化和迁移
// 若collapse为true，会正常渲染所有子菜单，默认折叠；若collapse为false，只渲染当前菜单，不渲染子菜单
// 注意：每条合法的且必须显示在左侧边栏的路由项必须存在唯一的path

export const routesConfig = [
  // {
  //   navlabel: true,
  //   name: 'Personal', // 虽然没有path，但能显示到侧边栏
  //   icon: 'mdi mdi-dots-horizontal',
  // },
  {
    path: 'basic',
    name: '工作台',
    icon: 'fa fa-home',
    component: Starter,
  },
  {
    path: 'analysis',
    name: '分析页',
    icon: 'fa fa-pie-chart',
    component: Starter,
    access: {
      requiredRoles: ['admin'],
    },
  },
  {
    path: 'monitor',
    name: '监控页',
    tags: ['新', '👍🏻️'],
    icon: 'fa fa-line-chart',
    component: 'starter/quickstart',
    access: {
      requiredRoles: ['user', 'admin'],
    },
  },
  {
    collapse: true,
    path: 'list',
    name: '列表页',
    icon: 'fa fa-list-ul',
    component: Starter,
    state: 'listPages',
    routes: [
      {
        path: 'list/basic',
        name: '基本列表',
        // icon: 'fa fa-bars',
        component: Quickstart,
      },
      {
        path: 'list/card',
        name: '卡片列表',
        icon: 'fa fa-bars',
        component: Starter,
      },
      {
        path: 'list/search',
        name: '搜索列表',
        // icon: 'fa fa-bars',
        component: 'about/routes-url-lists',
      },
    ],
  },
  {
    collapse: true,
    path: 'detail',
    name: '详情页',
    icon: 'fa fa-table',
    component: Starter,
    state: 'detailPages',
    routes: [
      {
        path: 'detail/basic',
        name: '基本详情',
        icon: 'fa fa-th',
        component: Starter,
      },
      {
        path: 'detail/advanced',
        name: '高级详情',
        icon: 'fa fa-th',
        component: Starter,
      },
    ],
  },
  {
    collapse: true,
    path: 'form',
    name: '表单页',
    icon: 'fa fa-edit',
    tags: ['新'],
    component: Starter,
    state: 'formPages',
    routes: [
      {
        path: 'form/basic',
        name: '基本表单',
        icon: 'fa fa-check-square-o',
        component: Quickstart,
      },
      {
        path: 'form/step',
        name: '分布表单',
        icon: 'fa fa-check-square-o',
        component: Starter,
      },
      {
        path: 'form/advanced',
        name: '高级表单',
        icon: 'fa fa-check-square-o',
        component: Starter,
      },
    ],
  },
  {
    collapse: true,
    path: 'result',
    name: '结果页',
    icon: 'fa fa-check-circle-o',
    component: Starter,
    state: 'resultPages',
    routes: [
      {
        path: 'result/success',
        name: '成功页',
        icon: 'fa fa-check',
        component: Quickstart,
      },
      {
        path: 'result/failure',
        name: '失败页',
        icon: 'fa fa-close',
        component: Starter,
      },
    ],
  },
  {
    collapse: true,
    path: 'exception',
    name: '异常页',
    icon: 'fa fa-warning',
    component: Starter,
    state: 'exceptionPages',
    routes: [
      {
        path: 'exception/404',
        name: '404',
        icon: 'fa fa-warning',
        component: 'exception/404',
      },
      {
        path: 'exception/500',
        name: '500',
        icon: 'fa fa-warning',
        component: 'exception/500',
        // component: Starter,
      },
    ],
  },
  {
    collapse: true,
    hideInMenu: true,
    path: 'account',
    name: '账户页',
    icon: 'fa fa-user-o',
    component: Starter,
    state: 'accountPages',
    access: {
      requiredRoles: ['admin', 'user'],
    },
    routes: [
      {
        path: 'account/center',
        name: '个人中心',
        icon: 'fa fa-user-circle-o',
        component: Starter,
      },
      {
        path: 'account/settings',
        name: '个人设置',
        icon: 'fa fa-cogs',
        component: Starter,
      },
      {
        path: 'account/register',
        name: '注册',
        icon: 'fa fa-user',
        component: Starter,
      },
      {
        path: 'account/login',
        name: '登录',
        icon: 'fa fa-user',
        component: Starter,
      },
    ],
  },
  {
    navlabel: true,
    name: '更多组件',
    icon: 'fa fa-ellipsis-h',
  },
  {
    collapse: true,
    path: 'editor',
    name: '编辑器',
    icon: 'fa fa-wpforms',
    component: Starter,
    state: 'editorPages',
    routes: [
      {
        path: 'editor/basic',
        name: '基本WYSIWYG',
        icon: 'fa fa-check',
        component: Starter,
        redirect: false,
      },
      {
        path: 'editor/markdown',
        name: 'markdown编辑器',
        icon: 'fa fa-close',
        component: Starter,
      },
      {
        navlabel: true,
        name: '更多编辑器',
        icon: 'fa fa-ellipsis-h',
      },
      {
        collapse: true,
        path: 'editor/examples',
        name: '更多编辑器示例',
        icon: 'fa fa-check-circle-o',
        component: Starter,
        state: 'editorExamplesPages',
        routes: [
          {
            path: 'editor/examples/basic',
            name: '基本示例',
            icon: 'fa fa-check',
            component: Starter,
          },
          {
            navlabel: true,
            name: '更多prosemirror',
            icon: 'fa fa-ellipsis-h',
          },
          {
            path: 'editor/examples/schema',
            name: 'schema文档模型',
            icon: 'fa fa-close',
            component: Starter,
          },
          {
            path: 'editor/examples/tooltip',
            name: '动态ToolTip',
            icon: 'fa fa-close',
            component: Starter,
          },
          {
            path: 'editor/examples/footnotes',
            name: '脚注footnotes',
            icon: 'fa fa-close',
            component: Starter,
            redirect: false,
          },
        ],
      },
    ],
  },
  // 不配置name，就不会在侧边栏菜单中显示，但仍可在网页中访问
  // {
  //   path: '*',
  //   component: 'exception/404',
  // },

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
