import '@icon-park/react/styles/index.css';
import './styles/normalize.css';
import './styles/editor.scss';
import './styles/theme-default.css';

// export styles
export * from './styles';

// export components
export * from './components';
export { NosIconProvider } from './config/icon-provider';
export { DragOverlayContent } from './plugins/wrapper';

// export all plugins
export {
  DndPluginContext,
  SlateExtended,
  useExtendedPlugin,
} from './slate-extended';
export * from './plugins';

// export utils
export { composePlugins } from './utils/plugins-config-compose';

// hooks to build your own editor
export {
  useEditor,
  usePlugins,
  usePluginsHandlers,
  useRenderElement,
  useRenderLeaf,
} from './components/use-editor';
export { usePersistedState } from './hooks/use-persisted-state';

// 💡 ready-to-use block editor
export { NosEditor } from './components/editor/noseditor';

// export types
export type { CustomEditor, CustomElement, CustomText } from './types/slate.d';
export type { NosPlugin } from './plugins/types';
