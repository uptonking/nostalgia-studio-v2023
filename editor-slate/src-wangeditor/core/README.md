# wangEditor core

[wangEditor](https://www.wangeditor.com/) core.

- 严格来说应该叫做“view core”。它基于 slate.js 内核，完成编辑器的 UI 部分。
- editor - 定义 slate 用于 DOM UI 的一些 API
- text-area - 输入区域 DOM 渲染，DOM 事件，选区同步，
- formats - 输入区域不同数据的渲染规则，如怎样渲染加粗、颜色、图片、list 等。可扩展注册。
- menus - 菜单，包括 toolbar、悬浮菜单、tooltip、右键菜单、DropPanel、Modal 等。可扩展注册。
- core 本身没有任何实际功能。需要通过 module 来扩展 formats、menus、plugins 等，来定义具体的功能。

## Main Functionalities

- View（ model -> vdom -> DOM ） + Selection
- Menus + toolbar + hoverbar
- Core editor APIs and events
- Register third-party modules (menus, plugins...)

## Main dependencies

- [slate.js](https://docs.slatejs.org/)
- [snabbdom.js](https://github.com/snabbdom/snabbdom)
