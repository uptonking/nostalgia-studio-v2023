import { NodeSelection, Plugin } from 'prosemirror-state';

import { getFeatureFlags } from '../../feature-flags-context';
import { createSelectionClickHandler } from '../../selection/utils';
import { codeBlockNodeView } from '../nodeviews/code-block';
import { highlightingCodeBlockNodeView } from '../nodeviews/highlighting-code-block';
import { pluginKey } from '../plugin-key';
import { codeBlockClassNames } from '../ui/class-names';
import { findCodeBlock } from '../utils';
import { ACTIONS } from './actions';
import { CodeBlockState } from './main-state';

export const createPlugin = (useLongPressSelection: boolean = false) =>
  new Plugin({
    state: {
      init(_, state): CodeBlockState {
        const node = findCodeBlock(state, state.selection);
        return {
          pos: node ? node.pos : null,
          contentCopied: false,
          isNodeSelected: false,
        };
      },
      apply(
        tr,
        pluginState: CodeBlockState,
        _oldState,
        newState,
      ): CodeBlockState {
        if (tr.docChanged || tr.selectionSet) {
          const node = findCodeBlock(newState, tr.selection);
          const newPluginState: CodeBlockState = {
            ...pluginState,
            pos: node ? node.pos : null,
            isNodeSelected: tr.selection instanceof NodeSelection,
          };
          return newPluginState;
        }

        const meta = tr.getMeta(pluginKey);

        if (meta?.type === ACTIONS.SET_COPIED_TO_CLIPBOARD) {
          return {
            ...pluginState,
            contentCopied: meta.data,
          };
        }

        return pluginState;
      },
    },
    key: pluginKey,
    props: {
      nodeViews: {
        codeBlock(node, view, getPos) {
          const featureFlags = getFeatureFlags(view.state);
          const createCodeBlockNodeView =
            featureFlags?.codeBlockSyntaxHighlighting
              ? highlightingCodeBlockNodeView()
              : codeBlockNodeView();
          return createCodeBlockNodeView(node, view, getPos);
        },
      },
      handleClickOn: createSelectionClickHandler(
        ['codeBlock'],
        (target) =>
          !!(
            target.closest(`.${codeBlockClassNames.gutter}`) ||
            target.classList.contains(codeBlockClassNames.content)
          ),
        { useLongPressSelection },
      ),
    },
  });
