import React, { useEffect, useState } from 'react';

import { css } from '@linaria/core';

import {
  PopoverContent,
  PopoverProvider,
  PopoverTrigger,
} from '../../../floating-ui';
import { PlusIcon } from '../icons';
import { headerMenuContainerCss } from '../styles';
import { ActionNames, grey, randomColor } from '../utils';

export function SelectCell({
  initialValue,
  options,
  columnId,
  rowIndex,
  dataDispatch,
}) {
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [showAddOptionInput, setShowAddOptionInput] = useState(false);
  const [addSelectRef, setAddSelectRef] = useState(null);

  const [value, setValue] = useState({ value: initialValue, update: false });

  useEffect(() => {
    setValue({ value: initialValue, update: false });
  }, [initialValue]);

  useEffect(() => {
    if (value.update) {
      dataDispatch({
        type: ActionNames.UPDATE_CELL,
        columnId,
        rowIndex,
        value: value.value,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, columnId, rowIndex]);

  useEffect(() => {
    if (addSelectRef && showAddOptionInput) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAddOptionInput]);

  function getColor() {
    const match = options.find((option) => option.label === value.value);
    return (match && match.backgroundColor) || grey(200);
  }

  function handleAddOption(e) {
    setShowAddOptionInput(true);
  }

  function handleOptionKeyDown(e) {
    if (e.key === 'Enter') {
      if (e.target.value !== '') {
        dataDispatch({
          type: ActionNames.ADD_OPTION_TO_COLUMN,
          option: e.target.value,
          backgroundColor: randomColor(),
          columnId,
        });
      }
      setShowAddOptionInput(false);
    }
  }

  function handleOptionBlur(e) {
    if (e.target.value !== '') {
      dataDispatch({
        type: ActionNames.ADD_OPTION_TO_COLUMN,
        option: e.target.value,
        backgroundColor: randomColor(),
        columnId,
      });
    }
    setShowAddOptionInput(false);
  }

  function handleOptionClick(option) {
    setValue({ value: option.label, update: true });
    setShowOptionsPanel(false);
  }

  useEffect(() => {
    if (addSelectRef && showAddOptionInput) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAddOptionInput]);

  return (
    <PopoverProvider
      open={showOptionsPanel}
      onOpenChange={setShowOptionsPanel}
      placement='bottom-start'
      offsetValue={-4}
    >
      <PopoverTrigger
        asChild={true}
        onClick={(e) => setShowOptionsPanel((v) => !v)}
      >
        <div className={optionsCellCss}>
          {value.value && (
            <OptionItem value={value.value} backgroundColor={getColor()} />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent initialFocus={false}>
        <div
          className={headerMenuContainerCss}
          style={{
            zIndex: 4,
            minWidth: 200,
            maxWidth: 320,
            maxHeight: 400,
            padding: '0.75rem',
            overflow: 'auto',
          }}
        >
          <div className={optionsContainerCss}>
            {options.map((option) => (
              <div
                key={option.label}
                className={optionItemContainerCss}
                onClick={() => handleOptionClick(option)}
              >
                <OptionItem
                  value={option.label}
                  backgroundColor={option.backgroundColor}
                />
              </div>
            ))}
            {showAddOptionInput && (
              <div
                className='mr-5 mt-5 bg-grey-200 border-radius-sm'
                style={{
                  width: 120,
                  padding: '2px 4px',
                }}
              >
                <input
                  type='text'
                  className={addOptionItemInputCss}
                  onBlur={handleOptionBlur}
                  ref={setAddSelectRef}
                  onKeyDown={handleOptionKeyDown}
                />
              </div>
            )}
            <div className={optionItemContainerCss} onClick={handleAddOption}>
              <OptionItem
                value={
                  <span className='svg-icon-sm svg-text'>
                    <PlusIcon />
                  </span>
                }
                backgroundColor={grey(200)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </PopoverProvider>
  );
}

export function OptionItem({ value, backgroundColor }) {
  return (
    <span className={optionItemCss} style={{ backgroundColor }}>
      {value}
    </span>
  );
}

const optionsCellCss = css`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
`;

const optionsContainerCss = css`
  display: flex;
  flex-wrap: wrap;
  margin-top: -0.5rem;
`;

const optionItemContainerCss = css`
  margin-top: 5px;
  margin-right: 5px;
`;

const optionItemCss = css`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: capitalize;
  font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'avenir next',
    avenir, 'segoe ui', 'helvetica neue', helvetica, Ubuntu, noto, arial,
    sans-serif;
`;

const addOptionItemInputCss = css`
  width: 100%;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'avenir next',
    avenir, 'segoe ui', 'helvetica neue', helvetica, Ubuntu, noto, arial,
    sans-serif;
  &:focus {
    outline: none;
  }
`;
