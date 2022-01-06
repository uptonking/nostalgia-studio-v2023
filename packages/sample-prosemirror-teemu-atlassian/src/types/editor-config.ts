import { ToolbarUIComponentFactory } from './editor-ui';
import { UIComponentFactory } from './editor-ui';
import { MarkConfig, NodeConfig } from './pm-config';
// TODO: Check if this circular dependency is still needed or is just legacy
import { PMPlugin } from './pm-plugin';

export interface EditorConfig {
  nodes: NodeConfig[];
  marks: MarkConfig[];
  pmPlugins: Array<PMPlugin>;
  contentComponents: UIComponentFactory[];
  primaryToolbarComponents: ToolbarUIComponentFactory[];
}
