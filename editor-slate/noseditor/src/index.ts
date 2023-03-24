import '@icon-park/react/styles/index.css';
import './styles/normalize.css';
import './styles/editor.scss';

// ready-to-use block editor
export { NosEditor } from './components/editor/noseditor';

// hooks to build your own editor
export {
  useEditor,
  usePlugins,
  usePluginsHandlers,
  useRenderElement,
  useRenderLeaf,
} from './components/use-editor';
export { usePersistedState } from './hooks/use-persisted-state';

// export all plugins
export * from './plugins';
export {
  DndPluginContext,
  SlateExtended,
  useExtendedPlugin,
} from './slate-extended';

// export components
export { NosIconProvider } from './config/icon-provider';

export { DragOverlayContent } from './plugins/wrapper';
export { EditorToolbar } from './components/editor-toolbar';

// export utils
export { composePlugins } from './utils/plugins-config-compose';

// export types
export type { CustomEditor, CustomElement, CustomText } from './types/slate.d';
export type { NosPlugin } from './plugins/types';
