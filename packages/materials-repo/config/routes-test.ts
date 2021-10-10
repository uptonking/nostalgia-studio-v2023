import Quickstart from '../src/pages/starter/quickstart-minimal';
import Starter from '../src/views/dashboard-starter';

// 简化的路由配置文件，方便测试

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
    component: Quickstart,
    access: {
      requiredRoles: ['user'],
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
        icon: 'fa fa-bars',
        component: Starter,
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
        icon: 'fa fa-bars',
        component: Quickstart,
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
        component: Starter,
      },
    ],
  },
];

export type RoutesConfigType = typeof routesConfig;

export default routesConfig;
