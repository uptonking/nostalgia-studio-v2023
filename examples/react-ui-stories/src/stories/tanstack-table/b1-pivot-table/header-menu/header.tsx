import React, { useEffect, useState } from 'react';

import { css } from '@linaria/core';

import {
  PopoverContent,
  PopoverProvider,
  PopoverTrigger,
} from '../../../floating-ui';
import { Constants } from '../utils';
import { AddColumnHeader } from './add-column-header';
import { ColumnTypeIcon } from './column-type-icon';
import { HeaderMenu } from './header-menu';

export function Header(props) {
  const {
    column: {
      columnDef: { id, created, label, dataType },
    },
    header,
    table,
  } = props;
  const dataDispatch = table.options.meta.dataDispatch;
  // console.log(';; header ', props);

  const [showHeaderMenu, setShowHeaderMenu] = useState(created || false);

  /* when the column is newly created, set it to open */
  useEffect(() => {
    if (created) {
      setShowHeaderMenu(true);
    }
  }, [created]);

  function getHeader() {
    if (id === Constants.ADD_COLUMN_ID) {
      return <AddColumnHeader dataDispatch={dataDispatch} />;
    }

    return (
      <PopoverProvider
        open={showHeaderMenu}
        onOpenChange={setShowHeaderMenu}
        placement='bottom-start'
        offsetValue={0}
      >
        <PopoverTrigger asChild={true}>
          <div className='th noselect d-inline-block'>
            <div
              className={thContentCss}
              onClick={(e) => setShowHeaderMenu((v) => !v)}
            >
              <span className={thIconCss}>
                <ColumnTypeIcon dataType={dataType} />
              </span>
              {label}
            </div>
            <div
              onMouseDown={header.getResizeHandler()}
              onTouchStart={header.getResizeHandler()}
              className={resizerCss}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent initialFocus={false}>
          <HeaderMenu
            label={label}
            dataType={dataType}
            dataDispatch={dataDispatch}
            columnId={id}
            header={header}
            setShowHeaderMenu={setShowHeaderMenu}
            table={table}
          />
        </PopoverContent>
      </PopoverProvider>
    );
  }

  return getHeader();
}

const thIconCss = css`
  margin-right: 6px;
  & svg {
    margin-top: 4px;
  }
`;

const thContentCss = css`
  display: flex;
  align-items: center;
  overflow-x: hidden;
  padding: 0.5rem;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const resizerCss = css`
  position: absolute;
  right: 0;
  top: 0;
  display: inline-block;
  width: 8px;
  height: 100%;
  transform: translateX(50%);
  z-index: 1;
  cursor: col-resize;
  touch-action: none;
  background: transparent;

  &:hover {
    background-color: #a5d8ff;
    cursor: col-resize;
  }
`;
