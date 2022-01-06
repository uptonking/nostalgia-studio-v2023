import { findDomRefAtPos } from 'prosemirror-utils';
import { defineMessages } from 'react-intl';

import CopyIcon from '@atlaskit/icon/glyph/copy';
import RemoveIcon from '@atlaskit/icon/glyph/editor/remove';

import commonMessages from '../../messages';
import type { Command } from '../../types';
import { hoverDecoration } from '../base/pm-plugins/decoration';
import type {
  FloatingToolbarButton,
  FloatingToolbarHandler,
  FloatingToolbarSelect,
  FloatingToolbarSeparator,
} from '../floating-toolbar/types';
import { SelectOption } from '../floating-toolbar/ui/Select';
import {
  changeLanguage,
  copyContentToClipboard,
  removeCodeBlock,
  resetCopiedState,
} from './actions';
import {
  DEFAULT_LANGUAGES,
  createLanguageList,
  getLanguageIdentifier,
} from './language-list';
import { pluginKey } from './plugin-key';
import type { CodeBlockState } from './pm-plugins/main-state';

export const messages = defineMessages({
  selectLanguage: {
    id: 'fabric.editor.selectLanguage',
    defaultMessage: 'Select language',
    description:
      'Code blocks display software code. A prompt to select the software language the code is written in.',
  },
});

const languageList = createLanguageList(DEFAULT_LANGUAGES);

export const getToolbarConfig =
  (allowCopyToClipboard: boolean = false): FloatingToolbarHandler =>
  (state, { formatMessage }) => {
    const codeBlockState: CodeBlockState | undefined =
      pluginKey.getState(state);
    const pos = codeBlockState?.pos ?? null;

    if (!codeBlockState || pos === null) {
      return;
    }

    const node = state.doc.nodeAt(pos);
    const nodeType = state.schema.nodes.codeBlock;

    if (node?.type !== nodeType) {
      return;
    }

    const language = node?.attrs?.language;

    const options = languageList.map((lang) => ({
      label: lang.name,
      value: getLanguageIdentifier(lang),
      alias: lang.alias,
    }));

    // If language is not undefined search for it in the value and then search in the aliases
    const defaultValue = language
      ? options.find((option) => option.value === language) ||
        options.find((option) => option.alias.includes(language as never))
      : undefined;

    const languageSelect: FloatingToolbarSelect<Command> = {
      id: 'editor.codeBlock.languageOptions',
      type: 'select',
      selectType: 'list',
      onChange: (option) => changeLanguage(option.value),
      defaultValue,
      placeholder: formatMessage(messages.selectLanguage),
      options,
      filterOption: languageListFilter,
    };

    const separator: FloatingToolbarSeparator = {
      type: 'separator',
    };

    const copyToClipboardItems = !allowCopyToClipboard
      ? []
      : ([
          {
            id: 'editor.codeBlock.copy',
            type: 'button',
            appearance: 'subtle',
            icon: CopyIcon,
            onClick: copyContentToClipboard,
            title: formatMessage(
              codeBlockState.contentCopied
                ? commonMessages.copiedToClipboard
                : commonMessages.copyToClipboard,
            ),
            onMouseLeave: resetCopiedState,
            hideTooltipOnClick: false,
            disabled: codeBlockState.isNodeSelected,
          },
          separator,
        ] as const);

    const deleteButton: FloatingToolbarButton<Command> = {
      id: 'editor.codeBlock.delete',
      type: 'button',
      appearance: 'danger',
      icon: RemoveIcon,
      onMouseEnter: hoverDecoration(nodeType, true),
      onMouseLeave: hoverDecoration(nodeType, false),
      onClick: removeCodeBlock,
      title: formatMessage(commonMessages.remove),
    };

    return {
      title: 'CodeBlock floating controls',
      getDomRef: (view) =>
        findDomRefAtPos(pos, view.domAtPos.bind(view)) as HTMLElement,
      nodeType,
      items: [languageSelect, separator, ...copyToClipboardItems, deleteButton],
    };
  };

/**
 * Filters language list based on both name and alias properties.
 */
export const languageListFilter = (option: SelectOption, rawInput: string) => {
  const { data } = option as any;
  const searchString = rawInput.toLowerCase();
  return (
    data.label.toLowerCase().includes(searchString) ||
    data.alias.some((alias: string) => alias.toLowerCase() === searchString)
  );
};
