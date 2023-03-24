import React from 'react';

import { Range } from 'slate';
import { useSlate } from 'slate-react';

export const Placeholder = () => {
  const editor = useSlate();

  if (!(editor.selection && Range.isCollapsed(editor.selection))) {
    return null;
  }

  return (
    <div contentEditable={false} className='placeholder clipboardSkip'>
      Start writing and creating...
    </div>
  );
};

