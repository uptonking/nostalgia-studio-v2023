import React, {
  ChangeEvent,
  Fragment,
  MouseEvent,
  useEffect,
  useState,
} from 'react';

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
  addMarkData,
  toggleElement,
  toggleMark,
  toggleTextAlign,
} from '../../../src/transforms';
import { AddLinkPanel } from './add-link-panel';
import { defaultToolbarConfig, TextAlignValueType } from './toolbar-config';

const toggleTextFormatHandler =
  (editor: Editor, format: TextFormats) =>
  (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    toggleMark(editor, format);
  };

const toggleTextAlignHandler =
  (editor: Editor, align?: TextAlignValueType) =>
  (event: ChangeEvent<HTMLSelectElement>) => {
    toggleTextAlign(editor, event.target.value as TextAlignValueType);
    // console.log(';; txt-align ', event.target.value)
  };

const addTextFormatHandler =
  (editor: Editor, format: TextFormats, value = true) =>
  (event: ChangeEvent<HTMLSelectElement>) => {
    // event.preventDefault();
    addMarkData(editor, { format, value: event.target.value });
  };

const checkIsMenuItemListType = (
  action: string,
): action is (typeof ListTypes)[keyof typeof ListTypes] =>
  Object.values(ListTypes).find((item) => item === action) !== undefined;

const toggleListTypesHandler =
  (editor: Editor, list: (typeof ListTypes)[keyof typeof ListTypes]) =>
  (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    toggleList(editor, { listType: list });
  };

const useShowAddLinkPanel = ({ initialShow = false } = {}) => {
  const [showAddLink, setShowAddLink] = useState(initialShow);
  return { showAddLink, setShowAddLink };
};

const useToolbarGroups = (initialConfig = defaultToolbarConfig) => {
  const [toolbarGroups, setToolbarGroups] = useState(initialConfig);
  return { toolbarGroups, setToolbarGroups };
};

export const NosToolbar = () => {
  const editor = useSlateStatic();
  const { showAddLink, setShowAddLink } = useShowAddLinkPanel();
  const { toolbarGroups, setToolbarGroups } = useToolbarGroups();

  return (
    <div className='nosedit-toolbar'>
      {toolbarGroups.map((group, groupIndex) => {
        const groupItemsElem = group.map((item, index2) => {
          const { type, icon: Icon, title } = item;
          if (type === 'button') {
            const { format, action } = item;
            if (format) {
              return (
                <IconButton
                  onMouseDown={toggleTextFormatHandler(editor, format)}
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
                  onMouseDown={toggleListTypesHandler(editor, action)}
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

            // more buttons actions
            return (
              <IconButton
                // onClick={(e) => {
                //   e.preventDefault();
                //   e.stopPropagation();
                //   setShowAddLink(true);
                // }}
                key={title}
                title={title}
              >
                <Icon />
              </IconButton>
            );
          }
          if (type === 'dropdown') {
            const { options, action } = item;
            if (action === 'align') {
              return (
                <ToolbarDropdown
                  editor={editor}
                  action={action}
                  options={options}
                  onChange={toggleTextAlignHandler(editor)}
                  key={index2}
                />
              );
            }

            if (action === 'fontSize') {
              return (
                <ToolbarDropdown
                  editor={editor}
                  action={action}
                  options={options}
                  onChange={addTextFormatHandler(editor, action)}
                  key={index2}
                />
              );
            }
          }
          return null;
        });
        return groupIndex === toolbarGroups.length - 1 ? (
          <Fragment key={groupIndex}>{groupItemsElem}</Fragment>
        ) : (
          <Fragment key={groupIndex}>
            {groupItemsElem}
            <div className={toolbarSeparatorCss}> </div>
          </Fragment>
        );
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

const ToolbarDropdown = ({ editor, action, options, onChange }) => {
  return (
    <select
      // value={activeMark(editor, format)}
      value={'bb'}
      onChange={onChange}
      className={dropdownCss}
    >
      {options.map(({ value, icon: Icon, title, text }) => (
        <option key={value} value={value} title={title}>
          {text}
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

const toolbarSeparatorCss = css`
  min-height: 20px;
  margin-left: ${themed.spacing.spacerS};
  margin-right: ${themed.spacing.spacerS};
  border-left: 1px solid ${themed.color.border.light};
  user-select: none;
`;
