import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';

import { type Editor } from 'slate';
import { useSlateStatic } from 'slate-react';

import { css } from '@linaria/core';

import { IconButton } from '../../../src';
import {
  Heading1Spec,
  Heading2Spec,
  Heading3Spec,
} from '../../../src/plugins/heading/utils';
import { toggleList } from '../../../src/plugins/list/commands';
import { ListTypes } from '../../../src/plugins/list/utils';
import type { TextFormats } from '../../../src/plugins/marks/types';
import { ParagraphSpec } from '../../../src/plugins/paragraph/utils';
import { themed } from '../../../src/styles';
import {
  toggleElement,
  toggleMark,
  toggleTextAlign,
} from '../../../src/transforms';
import { AddLinkPanel } from './add-link-panel';
import { TextAlignValueType, toolbarConfig } from './toolbar-config';

const textFormatHandler =
  (editor: Editor, format: TextFormats) =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      toggleMark(editor, format);
    };

const textAlignHandler =
  (editor: Editor, align?: TextAlignValueType) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      toggleTextAlign(editor, event.target.value as TextAlignValueType);
      // console.log(';; txt-align ', event.target.value)
    };

const checkIsMenuItemListType = (
  action: string,
): action is (typeof ListTypes)[keyof typeof ListTypes] =>
  Object.values(ListTypes).find((item) => item === action) !== undefined;

const listToggleHandler =
  (editor: Editor, list: (typeof ListTypes)[keyof typeof ListTypes]) =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      toggleList(editor, { listType: list });
    };

const useShowAddLink = ({ initialShow = false } = {}) => {
  const [showAddLink, setShowAddLink] = useState(initialShow);
  return { showAddLink, setShowAddLink };
};

const useToolbarGroups = (initialConfig = toolbarConfig) => {
  const [toolbarGroups, setToolbarGroups] = useState(initialConfig);
  return { toolbarGroups, setToolbarGroups };
};

export const NosToolbar = () => {
  const editor = useSlateStatic();
  const { showAddLink, setShowAddLink } = useShowAddLink();
  const { toolbarGroups, setToolbarGroups } = useToolbarGroups();

  return (
    <div className='nosedit-toolbar'>
      {toolbarGroups.map((item, index) => {
        const { type, icon: Icon, title } = item;
        if (type === 'button') {
          const { format, action } = item;
          if (format) {
            return (
              <IconButton
                onMouseDown={textFormatHandler(editor, format)}
                key={title}
                title={title}
              >
                <Icon />
              </IconButton>
            );
          }
          if (checkIsMenuItemListType(action)) {
            return (
              <IconButton
                onMouseDown={listToggleHandler(editor, action)}
                key={title}
                title={title}
              >
                <Icon />
              </IconButton>
            );
          }
          if (action === 'link') {
            return (
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddLink(true);
                }}
                key={title}
                title={title}
              >
                <Icon />
              </IconButton>
            );
          }
        }
        if (type === 'dropdown') {
          const { options, action } = item;
          return (
            <ToolbarDropdown
              editor={editor}
              action={action}
              options={options}
              key={index}
            />
          );
        }
        return null;
      })}
      {showAddLink ? (
        <AddLinkPanel
          showAddLink={showAddLink}
          setShowAddLink={setShowAddLink}
        />
      ) : null}
    </div>
  );
};

const ToolbarDropdown = ({ editor, action, options }) => {
  return (
    <select
      // value={activeMark(editor, format)}
      value={'bb'}
      onChange={textAlignHandler(editor)}
      className={dropdownCss}
    >
      {options.map(({ value, icon: Icon, title }) => (
        <option key={value} value={value} title={title}>
          {value}
          {/* <IconButton title={title}>
            <Icon title={title} />
          </IconButton> */}
        </option>
      ))}
    </select>
  );
};

const dropdownCss = css`
  min-width: 48px;
  border: none;
  border-radius: ${themed.size.borderRadius.sm};
  background-color: ${themed.palette.white};
  color: ${themed.color.text.muted};
  cursor: pointer;
  &:hover {
    background-color: ${themed.color.background};
  }
  &:focus-visible {
    outline-width: 0px;
  }

  & option {
    border: none;
  }
`;
