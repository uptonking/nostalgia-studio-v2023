import React, { useCallback, useMemo, useState } from 'react';

import { createEditor, type Descendant } from 'slate';
import {
  DefaultEditable as Editable,
  type RenderElementProps,
  Slate,
  withReact,
} from 'slate-react';

import { CustomTable, CustomTableCell, CustomTableRow, withTable } from '.';
import { initialValue } from './tableData';
import { withTableUtils } from './withCustom';

const CustomElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'table':
      return <CustomTable {...props} />;
    case 'tableRow':
      return <CustomTableRow {...props} />;
    case 'tableCell':
      return <CustomTableCell {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export function TableContextMenu() {
  const [value] = useState<Descendant[]>(initialValue);

  const editor = (window['edit'] = useMemo(
    () => withTable(withTableUtils(withReact(createEditor()))),
    [],
  ));

  const renderElement = useCallback(
    (props) => <CustomElement {...props} />,
    [],
  );

  return (
    <div className='App'>
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          // console.log(';;onChg ', JSON.stringify(editor.selection),);
          console.log(JSON.stringify(editor.operations), editor);
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
            // console.log(';; ed-mouse-down ')
            editor.emit('mousedown', e);
          }}
          onBlur={() => {
            // console.log(';; ed-blur ')
            editor.emit('blur');
          }}
        />
      </Slate>
    </div>
  );
}
