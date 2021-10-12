# react dashboard app

> A configurable dashboard built with react.

# overview
- features
  - themeable, dark mode out of the box
  - configurable layout
  - configurable routes
# 开始使用

```
npm run start
```

# 配置约定
- 在项目运行前支持的配置项，只作为默认初始值，后续修改不会生效
  - `./config/defaultSettings.ts` 暂时支持的配置项很少，只包括标题、主题色

- dev-server开发模式下支持的配置
  - 通过右侧设置面板直接在界面中配置界面布局、主题
  - `./config/routes.ts` 配置路由及其对应的文件路径
# 路由配置
- `./config/routes.ts`配置的路由会在左侧边栏的菜单项中出现
  - 若要不显示在左侧边栏中，可不配置`name`

- 每个path支持配置的`component`包括
  - react组件
  - pages目录下.tsx文件的相对路径

- path支持配置外部链接，以 http(s) 开头，此时 `component` 配置项会被忽略
# 布局配置
- 左侧边栏
  - 普通侧边栏
  - mini侧边栏
  - 不显示侧边栏
  - 可切换固定、滚动

- 右侧配置面板
  - 显示/隐藏浮动按钮
  - 不显示右侧配置面板
  - 可切换固定、滚动
# screenshot
- 默认布局：左侧边栏显示，右侧面板浮动

<img src='https://github.com/datalking/nostalgia-studio-lab/blob/main/packages/nostalgia-dashboard/doc/img/board-default-layout.png' width = '800'>

- 设置布局：左侧边栏隐藏，右侧面板dock

<img src='https://github.com/datalking/nostalgia-studio-lab/blob/main/packages/nostalgia-dashboard/doc/img/board-left-hidden-right-dock.png' width = '800'>

- 设置布局：非全宽界面，dark模式

<img src='https://github.com/datalking/nostalgia-studio-lab/blob/main/packages/nostalgia-dashboard/doc/img/board-dark-compat-width.png' width = '800'>

# notes
- heavily inspired by [Ant Design Pro](https://github.com/ant-design/ant-design-pro)
