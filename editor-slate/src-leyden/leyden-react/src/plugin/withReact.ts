import { type BaseEditor, type Editor } from 'slate';
import { withReact as withSlateReact } from 'slate-react';

import { type ReactEditor } from './ReactEditor';

export const withReact = <T extends BaseEditor>(
  editor: T,
): T & Editor & ReactEditor => {
  const e = withSlateReact(editor as T & ReactEditor);

  return e;
};
