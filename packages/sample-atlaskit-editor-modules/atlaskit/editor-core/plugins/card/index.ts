import { PluginKey } from 'prosemirror-state';

import { blockCard, embedCard, inlineCard } from '../../../adf-schema';
import { CardOptions } from '../../../editor-common';
import { EditorPlugin } from '../../types';
import { createPlugin } from './pm-plugins/main';
import { floatingToolbar } from './toolbar';

export const stateKey = new PluginKey('cardPlugin');

const cardPlugin = (
  options: CardOptions & {
    platform: 'mobile' | 'web';
    fullWidthMode?: boolean;
  },
): EditorPlugin => {
  return {
    name: 'card',

    nodes() {
      const nodes = [
        { name: 'inlineCard', node: inlineCard },
        { name: 'blockCard', node: blockCard },
      ];

      if (options.allowEmbeds) {
        nodes.push({
          name: 'embedCard',
          node: embedCard,
        });
      }

      return nodes;
    },

    pmPlugins() {
      const allowResizing = options.allowResizing ?? true;
      const useAlternativePreloader = options.useAlternativePreloader ?? true;
      return [
        {
          name: 'card',
          plugin: createPlugin(
            options.platform,
            allowResizing,
            useAlternativePreloader,
            options.fullWidthMode,
          ),
        },
      ];
    },

    pluginsOptions: {
      floatingToolbar: floatingToolbar(options, options.platform),
    },
  };
};

export default cardPlugin;
