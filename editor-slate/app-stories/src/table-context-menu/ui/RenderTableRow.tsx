import React from 'react';

import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';

import { getNextRowSpan } from '../utils/util';

export function CustomTableRow(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const editor = useSlate();

  const rowPath = ReactEditor.findPath(editor, element);
  const minRow = getNextRowSpan(editor, rowPath);

  return (
    <>
      <tr {...attributes} className='yt-e-table-row'>
        {children}
      </tr>
      {minRow > 1 &&
        Array.from({ length: minRow - 1 }).map((_, index) => (
          <tr key={index} />
        ))}
    </>
  );
}

