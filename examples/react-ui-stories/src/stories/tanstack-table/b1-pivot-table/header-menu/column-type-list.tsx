import React from 'react';

import { css } from '@linaria/core';

import {
  headerMenuContainerCss,
  listContainerCss,
  menuItemBtnCss,
} from '../styles';
import { ACTION_TYPES, COLUMN_TYPES, shortId } from '../utils';
import { ColumnTypeIcon } from './column-type-icon';

function getLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ColumnTypeList({
  dataDispatch,
  setShowTypeMenu,
  onClose,
  columnId,
}) {
  const types = [
    {
      type: COLUMN_TYPES.Select,
      onClick: (e) => {
        dataDispatch({
          type: ACTION_TYPES.Update_column_type,
          columnId,
          dataType: COLUMN_TYPES.Select,
        });
        onClose();
      },
      icon: <ColumnTypeIcon dataType={COLUMN_TYPES.Select} />,
      label: getLabel(COLUMN_TYPES.Select),
    },
    {
      type: COLUMN_TYPES.Text,
      onClick: (e) => {
        dataDispatch({
          type: ACTION_TYPES.Update_column_type,
          columnId,
          dataType: COLUMN_TYPES.Text,
        });
        onClose();
      },
      icon: <ColumnTypeIcon dataType={COLUMN_TYPES.Text} />,
      label: getLabel(COLUMN_TYPES.Text),
    },
    {
      type: COLUMN_TYPES.Number,
      onClick: (e) => {
        dataDispatch({
          type: ACTION_TYPES.Update_column_type,
          columnId,
          dataType: COLUMN_TYPES.Number,
        });
        onClose();
      },
      icon: <ColumnTypeIcon dataType={COLUMN_TYPES.Number} />,
      label: getLabel(COLUMN_TYPES.Number),
    },
  ];

  return (
    <div
      className={
        headerMenuContainerCss + ' ' + listContainerCss + ' ' + rootCss
      }
      onMouseEnter={() => setShowTypeMenu(true)}
      onMouseLeave={() => setShowTypeMenu(false)}
    >
      {types.map((type) => (
        <button
          className={menuItemBtnCss}
          onClick={type.onClick}
          key={shortId()}
        >
          <span className='svg-icon svg-text icon-margin'>{type.icon}</span>
          {type.label}
        </button>
      ))}
    </div>
  );
}

const rootCss = css`
  width: 200px;
  background-color: white;
  z-index: 10;
`;
