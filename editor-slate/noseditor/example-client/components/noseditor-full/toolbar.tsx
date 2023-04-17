import React, {
  ChangeEvent,
  Fragment,
  MouseEvent,
  useEffect,
  useState,
} from 'react';

import { type Editor } from 'slate';
import { useSlate } from 'slate-react';

import { css } from '@linaria/core';

import { IconButton } from '../../../src';
import {
  isListBlockActive,
  toggleList,
} from '../../../src/plugins/list/commands';
import { ListVariants } from '../../../src/plugins/list/utils';
import type { TextFormats } from '../../../src/plugins/marks/types';
import { insertTableByRowColNumber } from '../../../src/plugins/table/commands';
import { themed } from '../../../src/styles';
import {
  addMarkData,
  getActiveBlockType,
  isBlockActive,
  isMarkActive,
  toggleBlock,
  toggleMark,
  toggleTextAlign,
} from '../../../src/transforms';
import {
  ColorPicker,
  FloatingActionPanel,
  InsertImageApproaches,
  InsertTablePanel,
  ToolbarBtnActiveClassName,
  ToolbarButton,
} from './toolbar-buttons';
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
      event.preventDefault();
      toggleTextAlign(editor, event.target.value as TextAlignValueType);
      // console.log(';; txt-align ', event.target.value)
    };

/** used to add fontSize, also support other formats */
const addTextFormatHandler =
  (editor: Editor, format: TextFormats, value = true) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      event.preventDefault();
      addMarkData(editor, { format, value: event.target.value });
    };

const checkIsMenuItemListType = (
  action: string,
): action is (typeof ListVariants)[keyof typeof ListVariants] =>
  Object.values(ListVariants).find((item) => item === action) !== undefined;

const toggleListTypesHandler =
  (editor: Editor, list: (typeof ListVariants)[keyof typeof ListVariants]) =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      toggleList(editor, { listType: list });
    };

const toggleBlockTypesHandler =
  (editor: Editor) => (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    toggleBlock(editor, event.target.value as any);
  };

const useShowFloatingPanel = ({ initialShow = false } = {}) => {
  const [showFloatingPanel, setShowFloatingPanel] = useState(initialShow);
  return { showFloatingPanel, setShowFloatingPanel };
};
const useFloatingPanelType = () => {
  const [panelType, setPanelType] = useState<'image' | 'link'>('image');
  return { panelType, setPanelType };
};

const useToolbarGroupsConfig = (initialConfig = defaultToolbarConfig) => {
  const [toolbarGroups, setToolbarGroups] = useState(initialConfig);
  return { toolbarGroups, setToolbarGroups };
};

/**
 * todo make toolbar customizable
 */
export const NosToolbar = (props_) => {
  const editor = useSlate();
  const { showFloatingPanel, setShowFloatingPanel } = useShowFloatingPanel();
  const { panelType, setPanelType } = useFloatingPanelType();
  const { toolbarGroups, setToolbarGroups } = useToolbarGroupsConfig();

  return (
    <div className='nosedit-toolbar'>
      {toolbarGroups.map((group, groupIndex) => {
        const groupItemsElem = group.map((item, index2) => {
          const { type, icon: Icon, title } = item;
          if (type === 'button') {
            const { format, action } = item;

            if (checkIsMenuItemListType(action)) {
              return (
                <ToolbarButton
                  onMouseDown={toggleListTypesHandler(editor, action)}
                  className={
                    isListBlockActive(editor, action)
                      ? ToolbarBtnActiveClassName
                      : ''
                  }
                  key={title}
                  title={title}
                >
                  <Icon />
                </ToolbarButton>
              );
            }
            if (action === 'link') {
              return (
                <ToolbarButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPanelType('link');
                    setShowFloatingPanel(true);
                  }}
                  className={
                    isBlockActive(editor, action)
                      ? ToolbarBtnActiveClassName
                      : ''
                  }
                  key={title}
                  title={title}
                >
                  <Icon />
                </ToolbarButton>
              );
            }
            if (action === 'image') {
              return (
                <InsertImageApproaches
                  {...item}
                  setShowFloatingPanel={setShowFloatingPanel}
                  setPanelType={setPanelType}
                  key={title}
                />
              );
            }
            if (action === 'table') {
              return <InsertTablePanel {...item} key={title} />;
            }
            if (action === 'colorPicker') {
              const format = item.format as 'color' | 'bgColor';
              return (
                <ColorPicker
                  editor={editor}
                  format={format}
                  icon={Icon}
                  key={title}
                  title={title}
                />
              );
            }

            if (format) {
              // /for bold/italic/underline
              return (
                <ToolbarButton
                  onMouseDown={toggleTextFormatHandler(editor, format)}
                  className={
                    isMarkActive(editor, format)
                      ? ToolbarBtnActiveClassName
                      : ''
                  }
                  key={title}
                  title={title}
                >
                  <Icon />
                </ToolbarButton>
              );
            }

            // /more buttons actions
            return (
              <IconButton key={title} title={title}>
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
                  value='alignLeft'
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
                  value={'16px'}
                  onChange={addTextFormatHandler(editor, action)}
                  key={index2}
                />
              );
            }

            if (action === 'blockTypes') {
              return (
                <ToolbarDropdown
                  editor={editor}
                  action={action}
                  options={options}
                  value={getActiveBlockType(editor)}
                  onChange={toggleBlockTypesHandler(editor)}
                  key={index2}
                />
              );
            }

            // /more dropdown actions
            return (
              <ToolbarDropdown
                editor={editor}
                action={action}
                options={options}
                value=''
                // onChange={addTextFormatHandler(editor, action)}
                onChange={() => { }}
                key={index2}
              />
            );
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
      {setShowFloatingPanel ? (
        <FloatingActionPanel
          type={panelType}
          showFloatingPanel={showFloatingPanel}
          setShowFloatingPanel={setShowFloatingPanel}
        />
      ) : null}
    </div>
  );
};

const ToolbarDropdown = ({ editor, action, options, value, onChange }) => {
  return (
    <select
      // value={activeMark(editor, format)}
      value={value ?? 'defaultValue'}
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
    background-color: ${themed.color.background.hover};
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
  margin-left: ${themed.spacing.spacer.sm};
  margin-right: ${themed.spacing.spacer.sm};
  border-left: 1px solid ${themed.color.border.light};
  user-select: none;
`;
