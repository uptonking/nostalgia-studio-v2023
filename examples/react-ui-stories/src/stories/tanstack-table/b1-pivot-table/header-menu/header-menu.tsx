import React, { useEffect, useState } from 'react';

import { css } from '@linaria/core';

import {
  PopoverContent,
  PopoverProvider,
  PopoverTrigger,
} from '../../../floating-ui';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  TrashIcon,
} from '../icons';
import {
  headerMenuContainerCss,
  listContainerCss,
  menuItemBtnCss,
} from '../styles';
import { ActionNames, grey, shortId } from '../utils';
import { ColumnTypeIcon } from './column-type-icon';
import { ColumnTypeList } from './column-type-list';

export function HeaderMenu({
  label,
  dataType,
  columnId,
  header,
  setSortBy = (...args: any[]) => { },
  dataDispatch,
  setShowHeaderMenu,
  table,
}) {
  const [inputRef, setInputRef] = useState(null);
  const [title, setTitle] = useState(label);
  const [showTypeList, setShowTypeList] = useState(false);

  function onTypeMenuClose() {
    setShowTypeList(false);
    setShowHeaderMenu(false);
  }

  useEffect(() => {
    setTitle(label);
  }, [label]);

  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  }, [inputRef]);

  const buttons = [
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionNames.UPDATE_COLUMN_HEADER,
          columnId,
          label: title,
        });
        // console.log(';; sortAsc ', header.column.getNextSortingOrder(), header);
        const nextSort = header.column.getNextSortingOrder();
        if (nextSort === 'desc' || nextSort === 'asc') {
          table.setSorting([{ id: columnId, desc: false }]);
        } else {
          table.resetSorting();
        }
        setShowHeaderMenu(false);
      },
      icon: <ArrowUpIcon />,
      label: 'Sort ascending',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionNames.UPDATE_COLUMN_HEADER,
          columnId,
          label: title,
        });
        // console.log(';; sortDesc ', header.column.getNextSortingOrder(), header);
        const nextSort = header.column.getNextSortingOrder();
        if (nextSort === 'desc' || nextSort === false) {
          table.setSorting([{ id: columnId, desc: true }]);
        } else {
          table.resetSorting();
        }
        setShowHeaderMenu(false);
      },
      icon: <ArrowDownIcon />,
      label: 'Sort descending',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionNames.UPDATE_COLUMN_HEADER,
          columnId,
          label: title,
        });
        dataDispatch({
          type: ActionNames.ADD_COLUMN_TO_LEFT,
          columnId,
          focus: false,
        });
        setShowHeaderMenu(false);
      },
      icon: <ArrowLeftIcon />,
      label: 'Insert left',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionNames.UPDATE_COLUMN_HEADER,
          columnId,
          label: title,
        });
        dataDispatch({
          type: ActionNames.ADD_COLUMN_TO_RIGHT,
          columnId,
          focus: false,
        });
        setShowHeaderMenu(false);
      },
      icon: <ArrowRightIcon />,
      label: 'Insert right',
    },
    {
      onClick: (e) => {
        dataDispatch({ type: ActionNames.DELETE_COLUMN, columnId });
        setShowHeaderMenu(false);
      },
      icon: <TrashIcon />,
      label: 'Delete',
    },
  ];

  function handleColumnNameKeyDown(e) {
    if (e.key === 'Enter') {
      dataDispatch({
        type: ActionNames.UPDATE_COLUMN_HEADER,
        columnId,
        label: title,
      });
      setShowHeaderMenu(false);
    }
  }

  function handleColumnNameChange(e) {
    setTitle(e.target.value);
  }

  function handleColumnNameBlur(e) {
    e.preventDefault();
    dataDispatch({
      type: ActionNames.UPDATE_COLUMN_HEADER,
      columnId,
      label: title,
    });
  }

  return (
    <div
    // ref={popperRef}
    // style={{ ...popper.styles.popper, zIndex: 3 }}
    // {...popper.attributes.popper}
    >
      <div className={headerMenuContainerCss + ' ' + headerMenuCss}>
        <div className={columnTypeContainerCss}>
          <div className={columnTypeInputContainerCss}>
            <input
              className={columnTypeInputCss}
              ref={setInputRef}
              type='text'
              value={title}
              onChange={handleColumnNameChange}
              onBlur={handleColumnNameBlur}
              onKeyDown={handleColumnNameKeyDown}
            />
          </div>
          <span className={columnTypeTextCss}>Property Type</span>
        </div>
        <div className={listContainerCss}>
          <PopoverProvider
            open={showTypeList}
            onOpenChange={setShowTypeList}
            placement='right-start'
            offsetValue={-4}
          >
            <PopoverTrigger
              asChild={true}
              onClick={(e) => setShowTypeList((v) => !v)}
            >
              <button
                className={menuItemBtnCss}
                onMouseEnter={() => setShowTypeList(true)}
                onMouseLeave={() => setShowTypeList(false)}
                type='button'
              >
                <span className='svg-icon svg-text icon-margin'>
                  <ColumnTypeIcon dataType={dataType} />
                </span>
                <span className='text-transform-capitalize'>{dataType}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent initialFocus={false}>
              <ColumnTypeList
                onClose={onTypeMenuClose}
                setShowTypeMenu={setShowTypeList}
                columnId={columnId}
                dataDispatch={dataDispatch}
              />
            </PopoverContent>
          </PopoverProvider>
        </div>

        <div style={{ borderTop: `2px solid ${grey(200)}` }} />

        <div className={listContainerCss}>
          {buttons.map((button) => (
            <button
              type='button'
              className={menuItemBtnCss}
              onMouseDown={button.onClick}
              key={shortId()}
            >
              <span className='svg-icon svg-text icon-margin'>
                {button.icon}
              </span>
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const headerMenuCss = css`
  width: 240px;
`;

const columnTypeContainerCss = css`
  padding-top: 0.75rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
`;

const columnTypeInputContainerCss = css`
  width: 100%;
  margin-bottom: 12px;
`;

const columnTypeInputCss = css`
  box-sizing: border-box;
  width: 100%;
  padding: 0.375rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: #eeeeee;
  color: #424242;
  &:focus {
    outline: none;
    box-shadow: 0 0 1px 2px #8ecae6;
  }
`;

const columnTypeTextCss = css`
  color: #9e9e9e;
  text-transform: capitalize;
  font-size: 0.75rem;
  font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'avenir next',
    avenir, 'segoe ui', 'helvetica neue', helvetica, Ubuntu, noto, arial,
    sans-serif;
  font-weight: 600;
`;
