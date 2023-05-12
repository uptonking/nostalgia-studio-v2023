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
        <PopoverTrigger
          asChild={true}
          onClick={(e) => setShowHeaderMenu((v) => !v)}
        >
          <div className='th noselect d-inline-block'>
            <div className={thContentCss}>
              <span className={thIconCss}>
                <ColumnTypeIcon dataType={dataType} />
              </span>
              {label}
            </div>
            <div
              // {...getResizerProps()}
              className='resizer'
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
          // setSortBy={setSortBy}
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
