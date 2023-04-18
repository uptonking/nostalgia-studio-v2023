import '@icon-park/react/styles/index.css';
import './styles/theme-default.css';
import './styles/css-normalize.styles';
import './styles/editor-default.styles';

// styles
export * from './styles';

// basic ui components
export * from './components';

// 💡 ready-to-use block editor
export { NosEditor } from './components/editor/noseditor';

// editor plugins
export * from './plugins';

// hooks to build your own editor
export {
  useEditor,
  usePlugins,
  usePluginsHandlers,
  useRenderElement,
  useRenderLeaf,
} from './hooks';
export * from './hooks/utils';

// utils
export { composePlugins } from './utils';

// types
export type { CustomEditor, CustomElement, CustomText } from './types/slate.d';
export type { NosPlugin } from './plugins/types';
export type { FormattedText } from './plugins/marks/types';
