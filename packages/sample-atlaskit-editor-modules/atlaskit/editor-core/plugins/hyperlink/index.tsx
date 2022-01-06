import React from 'react';

import { link } from '../../../adf-schema';
import { CardOptions } from '../../../editor-common';
import { addLink, tooltip } from '../../keymaps';
import { EditorPlugin } from '../../types';
import {
  ACTION,
  ACTION_SUBJECT,
  ACTION_SUBJECT_ID,
  EVENT_TYPE,
  INPUT_METHOD,
  addAnalytics,
} from '../analytics';
import { messages } from '../insert-block/ui/ToolbarInsertBlock/messages';
import { IconLink } from '../quick-insert/assets';
import { getToolbarConfig } from './Toolbar';
import fakeCursorToolbarPlugin from './pm-plugins/fake-cursor-for-toolbar';
import { createInputRulePlugin } from './pm-plugins/input-rule';
import { createKeymapPlugin } from './pm-plugins/keymap';
import { LinkAction, plugin, stateKey } from './pm-plugins/main';

const hyperlinkPlugin = (options?: CardOptions): EditorPlugin => ({
  name: 'hyperlink',

  marks() {
    return [{ name: 'link', mark: link }];
  },

  pmPlugins() {
    // Skip analytics if card provider is available, as they will be
    // sent on handleRejected upon attempting to resolve smart link.
    const skipAnalytics = !!options && !!options.provider;
    return [
      { name: 'hyperlink', plugin: ({ dispatch }) => plugin(dispatch) },
      {
        name: 'fakeCursorToolbarPlugin',
        plugin: () => fakeCursorToolbarPlugin,
      },
      {
        name: 'hyperlinkInputRule',
        plugin: ({ schema, featureFlags }) =>
          createInputRulePlugin(schema, skipAnalytics, featureFlags),
      },
      {
        name: 'hyperlinkKeymap',
        plugin: () => createKeymapPlugin(skipAnalytics),
      },
    ];
  },

  pluginsOptions: {
    quickInsert: ({ formatMessage }) => [
      {
        id: 'hyperlink',
        title: formatMessage(messages.link),
        description: formatMessage(messages.linkDescription),
        keywords: ['hyperlink', 'url'],
        priority: 1200,
        keyshortcut: tooltip(addLink),
        icon: () => <IconLink />,
        action(_insert, state) {
          const pos = state.selection.from;
          const { nodeBefore } = state.selection.$from;
          if (!nodeBefore) {
            return false;
          }
          const tr = state.tr
            .setMeta(stateKey, { type: LinkAction.SHOW_INSERT_TOOLBAR })
            .delete(pos - nodeBefore.nodeSize, pos);

          return addAnalytics(state, tr, {
            action: ACTION.INVOKED,
            actionSubject: ACTION_SUBJECT.TYPEAHEAD,
            actionSubjectId: ACTION_SUBJECT_ID.TYPEAHEAD_LINK,
            attributes: { inputMethod: INPUT_METHOD.QUICK_INSERT },
            eventType: EVENT_TYPE.UI,
          });
        },
      },
    ],
    floatingToolbar: (state, intl, providerFactory) => {
      return getToolbarConfig(state, intl, providerFactory, options);
    },
  },
});

export type { HyperlinkState } from './pm-plugins/main';

export default hyperlinkPlugin;
