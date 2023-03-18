import '@icon-park/react/styles/index.css';
import './styles/normalize.css';
import './styles/editor.css';

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
