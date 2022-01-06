import * as React from 'react';

import { typeAheadQuery } from '../../../adf-schema';
import type { EditorPlugin } from '../../types';
import WithPluginState from '../../ui/WithPluginState';
import { inputRulePlugin } from './pm-plugins/input-rules';
import { keymapPlugin } from './pm-plugins/keymap';
import {
  TypeAheadPluginState,
  createInitialPluginState,
  createPlugin,
  pluginKey as typeAheadPluginKey,
} from './pm-plugins/main';
import type { TypeAheadHandler } from './types';
import { TypeAhead } from './ui/TypeAhead';

// import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';

type CreateUIAnalyticsEvent = any;

export type TypeAheadPluginOptions = {
  createAnalyticsEvent?: CreateUIAnalyticsEvent;
};

const typeAheadPlugin = (options?: TypeAheadPluginOptions): EditorPlugin => ({
  name: 'typeAhead',

  marks() {
    return [{ name: 'typeAheadQuery', mark: typeAheadQuery }];
  },

  pmPlugins(typeAhead: Array<TypeAheadHandler> = []) {
    return [
      {
        name: 'typeAhead',
        plugin: ({ dispatch, reactContext }) =>
          createPlugin(dispatch, reactContext, typeAhead),
      },
      {
        name: 'typeAheadInputRule',
        plugin: ({ schema, featureFlags }) =>
          inputRulePlugin(schema, typeAhead, featureFlags),
      },
      {
        name: 'typeAheadKeymap',
        plugin: () => keymapPlugin(),
      },
    ];
  },

  contentComponent({
    editorView,
    popupsMountPoint,
    popupsBoundariesElement,
    popupsScrollableElement,
  }) {
    return (
      <WithPluginState
        plugins={{
          typeAhead: typeAheadPluginKey,
        }}
        render={({
          typeAhead = createInitialPluginState(),
        }: {
          typeAhead?: TypeAheadPluginState;
        }) => {
          if (
            typeAhead.typeAheadHandler &&
            typeAhead.typeAheadHandler.headless
          ) {
            return null;
          }

          const { queryMarkPos } = typeAhead;
          let domRef = null;
          if (queryMarkPos !== null) {
            // temporary fix to avoid page crash until it is fixed properly
            try {
              domRef = editorView.domAtPos(queryMarkPos);
            } catch (ex) {
              return null;
            }
          }

          const anchorElement = domRef
            ? ((domRef.node as HTMLElement).childNodes[
                domRef.offset
              ] as HTMLElement)
            : undefined;

          return (
            <TypeAhead
              editorView={editorView}
              popupsMountPoint={popupsMountPoint}
              popupsBoundariesElement={popupsBoundariesElement}
              popupsScrollableElement={popupsScrollableElement}
              anchorElement={anchorElement}
              active={typeAhead.active}
              isLoading={!!typeAhead.itemsLoader}
              items={typeAhead.items}
              currentIndex={typeAhead.currentIndex}
              highlight={typeAhead.highlight}
              createAnalyticsEvent={options?.createAnalyticsEvent}
              query={typeAhead.query}
            />
          );
        }}
      />
    );
  },
});

export { typeAheadPluginKey };
export type { TypeAheadPluginState };
export default typeAheadPlugin;
