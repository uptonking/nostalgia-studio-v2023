import { baseKeymap } from 'prosemirror-commands';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { MenuItem, menuBar } from 'prosemirror-menu';
import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

import { buildInputRules } from './inputrules';
import { buildKeymap } from './keymap';
import { buildMenuItems } from './menu';

export { buildMenuItems, buildKeymap, buildInputRules };

/// Create an array of plugins pre-configured for the given schema.
/// The resulting array will include the following plugins:
///
///  * Input rules for smart quotes and creating the block types in the
///    schema using markdown conventions (say `"> "` to create a
///    blockquote)
///
///  * A keymap that defines keys to create and manipulate the nodes in the
///    schema
///
///  * A keymap binding the default keys provided by the
///    prosemirror-commands module
///
///  * The undo history plugin
///
///  * The drop cursor plugin
///
///  * The gap cursor plugin
///
///  * A custom plugin that adds a `menuContent` prop for the
///    prosemirror-menu wrapper, and a CSS class that enables the
///    additional styling defined in `style/style.css` in this package
///
/// Probably only useful for quickly setting up a passable
/// editor—you'll need more control over your settings in most
/// real-world situations.
export function exampleSetup(options: {
  /// The schema to generate key bindings and menu items for.
  schema: Schema;

  /// Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
  mapKeys?: { [key: string]: string | false };

  /// Set to false to disable the menu bar.
  menuBar?: boolean;

  /// Set to false to disable the history plugin.
  history?: boolean;

  /// Set to false to make the menu bar non-floating.
  floatingMenu?: boolean;

  /// Can be used to override the menu content.
  menuContent?: MenuItem[][];
}) {
  const plugins = [
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema, options.mapKeys)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
  ];
  if (options.menuBar !== false)
    plugins.push(
      menuBar({
        floating: options.floatingMenu !== false,
        content: options.menuContent || buildMenuItems(options.schema).fullMenu,
      }),
    );
  if (options.history !== false) plugins.push(history());

  return plugins.concat(
    new Plugin({
      props: {
        attributes: { class: 'ProseMirror-example-setup-style' },
      },
    }),
  );
}
