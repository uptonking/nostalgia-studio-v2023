import React from 'react';

import {
  headerMenuContainerCss,
  listContainerCss,
  menuItemBtnCss,
} from '../styles';
import { ActionNames, ColumnTypes, shortId } from '../utils';
import { ColumnTypeIcon } from './column-type-icon';

function getLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ColumnTypeList({
  // popper,
  // popperRef,
  dataDispatch,
  setShowTypeMenu,
  onClose,
  columnId,
}) {
  const types = [
    {
      type: ColumnTypes.SELECT,
      onClick: (e) => {
        dataDispatch({
          type: ActionNames.UPDATE_COLUMN_TYPE,
          columnId,
          dataType: ColumnTypes.SELECT,
        });
        onClose();
      },
      icon: <ColumnTypeIcon dataType={ColumnTypes.SELECT} />,
      label: getLabel(ColumnTypes.SELECT),
    },
    {
      type: ColumnTypes.TEXT,
      onClick: (e) => {
        dataDispatch({
          type: ActionNames.UPDATE_COLUMN_TYPE,
          columnId,
          dataType: ColumnTypes.TEXT,
        });
        onClose();
      },
      icon: <ColumnTypeIcon dataType={ColumnTypes.TEXT} />,
      label: getLabel(ColumnTypes.TEXT),
    },
    {
      type: ColumnTypes.NUMBER,
      onClick: (e) => {
        dataDispatch({
          type: ActionNames.UPDATE_COLUMN_TYPE,
          columnId,
          dataType: ColumnTypes.NUMBER,
        });
        onClose();
      },
      icon: <ColumnTypeIcon dataType={ColumnTypes.NUMBER} />,
      label: getLabel(ColumnTypes.NUMBER),
    },
  ];

  return (
    <div
      // ref={popperRef}
      // {...popper.attributes.popper}
      className={headerMenuContainerCss + ' ' + listContainerCss}
      onMouseEnter={() => setShowTypeMenu(true)}
      onMouseLeave={() => setShowTypeMenu(false)}
      style={{
        // ...popper.styles.popper,
        width: 200,
        backgroundColor: 'white',
        zIndex: 4,
      }}
    >
      {types.map((type) => (
        <button className={menuItemBtnCss} onClick={type.onClick} key={shortId()}>
          <span className='svg-icon svg-text icon-margin'>{type.icon}</span>
          {type.label}
        </button>
      ))}
    </div>
  );
}
