import {
  type ToolbarUIComponentFactory,
  type UIComponentFactory,
} from './editor-ui';

// TODO: Check if this circular dependency is still needed or is just legacy
// eslint-disable-next-line import/no-cycle
import { type PMPlugin } from './pm-plugin';
import { type MarkConfig, type NodeConfig } from './pm-config';

export interface EditorConfig {
  nodes: NodeConfig[];
  marks: MarkConfig[];
  pmPlugins: Array<PMPlugin>;
  contentComponents: UIComponentFactory[];
  primaryToolbarComponents: ToolbarUIComponentFactory[];
}
