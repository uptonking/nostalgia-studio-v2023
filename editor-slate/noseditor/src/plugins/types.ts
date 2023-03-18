import type { Editor } from 'slate';
import type {
  Editable,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react';

export type EditableProps = Parameters<typeof Editable>[0];

export type ElementProps = {
  element: RenderElementProps['element'];
  children: RenderElementProps['children'];
  attributes?: RenderElementProps['attributes'];
};

export type EventHandler = (editor: Editor) => (event: any) => unknown;
export type EventHandlers = Record<string, EventHandler>;

/**
 * A plugin provides config for slate editor.
 * - it can add commands to editor
 * - render custom element or leaf
 * - handle events
 */
export type NosPlugin = {
  /** a typical slate plugin */
  withOverrides?: (editor: Editor) => Editor;
  handlers?: EventHandlers;
  renderElement?: (props: ElementProps) => JSX.Element | null;
  renderLeaf?: (props: RenderLeafProps) => JSX.Element | null;
};

/** NosPlugin factory
 *
 * todo name not start with Use.
 */
export type UseNosPlugin<Options = {}> = (options?: Options) => NosPlugin;
