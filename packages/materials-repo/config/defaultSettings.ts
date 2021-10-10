// 全局默认初始值，只在各组件初始化时使用，只有在构建编译运行前修改本文件内容，修改才能生效；
// 当项目正在运行时，若修改此文件，界面不会显示新值，需要重新运行项目才能显示新值

// todo  大多数配置未实现，只作为示例

const globalSettings = {
  title: 'materials-repo 资料库',
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  primaryColor: '#3cba52',
  navTheme: 'light',
  colorWeak: false,
  // iconfontUrl: '',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSidebar: true,
  pwa: false,

  // 后端相关配置

  repoRootAbsolutePath:
    '/media/yaoo/win10/active/osharing/repos4datalking/nostalgia-studio/packages/materials-repo/repos',
  defaultLocalUsername: 'admin',
};

export default globalSettings;
