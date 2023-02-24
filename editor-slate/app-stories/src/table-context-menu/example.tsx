import React, { useCallback, useMemo, useState } from 'react';

import { createEditor, Descendant } from 'slate';
import {
  DefaultEditable as Editable,
  RenderElementProps,
  Slate,
  withReact,
} from 'slate-react';

import { RenderTable, RenderTableCell, RenderTableRow, withTable } from '.';
import { initialValue } from './tableData';
import { withTableUtils } from './withCustom';

const CustomElements = (elementProp: RenderElementProps) => {
  const { attributes, children, element } = elementProp;
  switch (element.type) {
    case 'table':
      return <RenderTable {...elementProp} />;
    case 'tableRow':
      return <RenderTableRow {...elementProp} />;
    case 'tableCell':
      return <RenderTableCell {...elementProp} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export function TableCtxMenu() {
  const editor = useMemo(
    () => withTable(withTableUtils(withReact(createEditor()))),
    [],
  );
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const renderElement = useCallback(
    (props) => <CustomElements {...props} />,
    [],
  );

  return (
    <div className='App'>
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          console.log(';;onChg ', newValue);
          // setValue(newValue);
        }}
      >
        {/* <div className="toolbar"><AddTable /></div> */}
        <Editable
          className='editor'
          autoFocus
          renderElement={renderElement}
          onKeyDown={(e) => {
            editor.emit('keydown', e);
          }}
          onMouseDown={(e) => {
            editor.emit('mousedown', e);
          }}
          onBlur={() => {
            editor.emit('blur');
          }}
        />
      </Slate>
    </div>
  );
}
