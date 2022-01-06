import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';

import { doc, paragraph, text } from '../../../adf-schema';
import { browser } from '../../../editor-common';
import type { EditorPlugin, PMPluginFactory } from '../../types';
import type {
  BrowserFreezetracking,
  InputTracking,
} from '../../types/performance-tracking';
import { keymap } from '../../utils/keymap';
import betterTypeHistoryPlugin from './pm-plugins/better-type-history';
import contextIdentifierPlugin from './pm-plugins/context-identifier';
import decorationPlugin from './pm-plugins/decoration';
import filterStepsPlugin from './pm-plugins/filter-steps';
import fixChrome88SelectionPlugin from './pm-plugins/fix-chrome-88-selection';
import focusHandlerPlugin from './pm-plugins/focus-handler';
import frozenEditor from './pm-plugins/frozen-editor';
import inlineCursorTargetPlugin from './pm-plugins/inline-cursor-target';
import newlinePreserveMarksPlugin from './pm-plugins/newline-preserve-marks';
import { plugin as reactNodeView } from './pm-plugins/react-nodeview';
import scrollGutter, {
  ScrollGutterPluginOptions,
} from './pm-plugins/scroll-gutter';

export interface BasePluginOptions {
  allowScrollGutter?: ScrollGutterPluginOptions;
  allowInlineCursorTarget?: boolean;
  inputTracking?: InputTracking;
  browserFreezeTracking?: BrowserFreezetracking;
}

// Chrome >= 88
export const isChromeWithSelectionBug =
  browser.chrome && browser.chrome_version >= 88;

const basePlugin = (options?: BasePluginOptions): EditorPlugin => ({
  name: 'base',

  pmPlugins() {
    const plugins: { name: string; plugin: PMPluginFactory }[] = [
      {
        name: 'filterStepsPlugin',
        plugin: ({ dispatchAnalyticsEvent }) =>
          filterStepsPlugin(dispatchAnalyticsEvent),
      },
      {
        name: 'inlineCursorTargetPlugin',
        plugin: () =>
          options && options.allowInlineCursorTarget
            ? inlineCursorTargetPlugin()
            : undefined,
      },
      {
        name: 'focusHandlerPlugin',
        plugin: ({ dispatch }) => focusHandlerPlugin(dispatch),
      },
      {
        name: 'newlinePreserveMarksPlugin',
        plugin: newlinePreserveMarksPlugin,
      },
      { name: 'reactNodeView', plugin: () => reactNodeView },
      {
        name: 'frozenEditor',
        plugin: ({ dispatchAnalyticsEvent, providerFactory }) => {
          return options &&
            options.inputTracking &&
            options.inputTracking.enabled
            ? frozenEditor(
                dispatchAnalyticsEvent,
                options.inputTracking,
                options.browserFreezeTracking,
              )
            : undefined;
        },
      },
      { name: 'decorationPlugin', plugin: () => decorationPlugin() },
      { name: 'history', plugin: () => history() },
      // should be last :
      {
        name: 'codeBlockIndent',
        plugin: () =>
          keymap({
            // 设置基本快捷键；若注释掉，则按回车键不会换行，但ctrl-z/y仍可undo/redo
            ...baseKeymap,
            'Mod-[': () => true,
            'Mod-]': () => true,
          }),
      },
      {
        name: 'contextIdentifier',
        plugin: ({ dispatch, providerFactory }) =>
          contextIdentifierPlugin(dispatch, providerFactory),
      },
      {
        name: 'betterTypeHistory',
        plugin: ({ dispatch, providerFactory }) => betterTypeHistoryPlugin(),
      },
    ];

    if (options && options.allowScrollGutter) {
      plugins.push({
        name: 'scrollGutterPlugin',
        plugin: () => scrollGutter(options.allowScrollGutter),
      });
    }

    if (isChromeWithSelectionBug) {
      plugins.push({
        name: 'fixChrome88SelectionPlugin',
        plugin: () => fixChrome88SelectionPlugin(),
      });
    }

    return plugins;
  },
  nodes() {
    return [
      { name: 'doc', node: doc },
      { name: 'paragraph', node: paragraph },
      { name: 'text', node: text },
    ];
  },
});

export default basePlugin;
