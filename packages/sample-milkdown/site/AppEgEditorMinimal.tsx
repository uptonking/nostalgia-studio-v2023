import '../src/themes/nord.css';

import * as React from 'react';

import { Editor, ReactEditor, commonmark, useEditor } from '../src/index';

export function AppEgEditorMinimal() {
  const editor = useEditor((root) =>
    new Editor({ root, defaultValue: `# hello, milkdown 编辑器` }).use(
      commonmark,
    ),
  );

  return <ReactEditor editor={editor} />;
}

export default AppEgEditorMinimal;
