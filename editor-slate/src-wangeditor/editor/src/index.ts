/**
 * @description editor entry
 * @author wangfupeng
 */

import './assets/index.less';
// import '@wangeditor/core/dist/css/style.css';
// 兼容性（要放在最开始就执行）
import './utils/browser-polyfill';
import './utils/node-polyfill';
// 配置多语言
import './locale/index';
// 注册内置模块
import './register-builtin-modules/index';
// 初始化默认配置
import './init-default-config';

// 全局注册
import Boot from './Boot';

export { Boot };

// 导出 core API 和接口（注意，此处按需导出，不可直接用 `*` ）
export {
  createUploader,
  DomEditor,
  genModalButtonElems,
  genModalInputElems,
  genModalTextareaElems,
  i18nAddResources,
  i18nChangeLanguage,
  i18nGetResources,
  type IButtonMenu,
  type IDomEditor,
  type IDropPanelMenu,
  type IEditorConfig,
  type IModalMenu,
  type IModuleConf,
  type ISelectMenu,
  type IToolbarConfig,
  type IUploadConfig,
  t,
  Toolbar,
} from '@wangeditor/core';

// 导出 slate API 和接口 （需重命名，加 `Slate` 前缀）
export {
  type Descendant as SlateDescendant,
  Editor as SlateEditor,
  Element as SlateElement,
  Location as SlateLocation,
  Node as SlateNode,
  Path as SlatePath,
  Point as SlatePoint,
  Range as SlateRange,
  Text as SlateText,
  Transforms as SlateTransforms,
} from 'slate';

// 导出 create 函数
export { createEditor, createToolbar } from './create';

export default {};
