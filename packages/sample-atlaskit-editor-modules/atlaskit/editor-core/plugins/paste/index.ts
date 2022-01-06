import type { CardOptions } from '../../../editor-common';
import type { EditorPlugin } from '../../types';
import { createPlugin } from './pm-plugins/main';

export type PastePluginOptions = {
  cardOptions?: CardOptions;
  sanitizePrivateContent?: boolean;
  predictableLists?: boolean;
};

const pastePlugin = ({
  cardOptions,
  sanitizePrivateContent,
  predictableLists,
}: PastePluginOptions): EditorPlugin => ({
  name: 'paste',

  pmPlugins() {
    return [
      {
        name: 'paste',
        plugin: ({ schema, providerFactory, dispatchAnalyticsEvent }) =>
          createPlugin(
            schema,
            dispatchAnalyticsEvent,
            cardOptions,
            sanitizePrivateContent,
            predictableLists,
            providerFactory,
          ),
      },
    ];
  },
});

export default pastePlugin;
