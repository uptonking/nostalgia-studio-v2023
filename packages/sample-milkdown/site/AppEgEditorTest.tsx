import '../src/themes/nord.css';

import * as React from 'react';

import { Editor, ReactEditor, commonmark, useEditor } from '../src/index';

export function AppEgEditorTest() {
  const editor = useEditor((root) => new Editor({ root }).use(commonmark));

  return <ReactEditor editor={editor} />;
}

export default AppEgEditorTest;
