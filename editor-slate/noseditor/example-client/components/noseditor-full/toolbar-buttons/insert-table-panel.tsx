import React, { useEffect, useRef, useState } from 'react';

import { useSlateStatic } from 'slate-react';

import { css } from '@linaria/core';

import { IconButton } from '../../../../src/components/common';
import {
  insertTableByRowColNumber,
} from '../../../../src/plugins/table/commands';
import { themed } from '../../../../src/styles';
import { usePopup } from '../../../hooks/use-popup';
import { popupCss, popupWrapperCss } from '../../../styles/common-styles';

/** current table size by index starting from 0 */
type TableSizeByIndex = { row: number; col: number };

const EmptyRowCol: TableSizeByIndex = { row: -1, col: -1 };

export const InsertTablePanel = (props_) => {
  const { icon: Icon, title } = props_;

  const editor = useSlateStatic();

  const rootContainerRef = useRef<HTMLDivElement>();
  const [showPanel, setShowPanel] = usePopup(rootContainerRef);

  const [selection, setSelection] = useState();
  const [currRowCol, setCurrRowCol] =
    useState<TableSizeByIndex>(EmptyRowCol);

  const [tableGrid, setTableGrid] = useState(() =>
    Array(6)
      .fill(1)
      .map((row) =>
        Array(6)
          .fill(1)
          .map((val, colIndex) => ({ isSelected: false })),
      ),
  );

  useEffect(() => {
    const newTable = Array(6)
      .fill(1)
      .map((row, rowIndex) =>
        Array(6)
          .fill(1)
          .map((val, colIndex) => ({
            isSelected:
              rowIndex <= currRowCol.row && colIndex <= currRowCol.col,
          })),
      );
    setTableGrid(newTable);
  }, [currRowCol]);

  // const table = new TableUtil(editor);

  const handleButtonClick = () => {
    // setSelection(editor.selection);
    setShowPanel((prev) => !prev);
    setCurrRowCol(EmptyRowCol);
  };

  const handleInsert = () => {
    // selection && Transforms.select(editor, selection);
    // table.insertTable(tableData.row, tableData.column);
    insertTableByRowColNumber(editor, {
      row: currRowCol.row + 1,
      col: currRowCol.col + 1,
    });
    setCurrRowCol(EmptyRowCol);
    setShowPanel(false);
  };

  return (
    <div ref={rootContainerRef} className={popupWrapperCss}>
      <IconButton onMouseDown={handleButtonClick} title={title}>
        <Icon />
      </IconButton>
      {showPanel && (
        <div className={popupCss}>
          <div>
            {currRowCol.row >= 0 ? (
              `${currRowCol.row + 1} x ${currRowCol.col + 1}`
            ) : (
              <>&nbsp;</>
            )}
          </div>
          <div className={tableGridCss}>
            {tableGrid.map((row, rowIndex) =>
              row.map(({ isSelected }, colIndex) => (
                <div
                  onClick={handleInsert}
                  onMouseOver={() =>
                    setCurrRowCol({ row: rowIndex, col: colIndex })
                  }
                  className={tableUnitCss}
                  style={{
                    border: `1px solid ${
                      isSelected
                        ? themed.color.brand.dark
                        : themed.color.border.light
                    }`,
                  }}
                  key={colIndex}
                />
              )),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const tableGridCss = css`
  display: grid;
  grid-template-columns: auto auto auto auto auto auto;
  gap: 3px;
`;

const tableUnitCss = css`
  width: 16px;
  height: 16px;
  border: 1px solid ${themed.color.border.light};
`;
