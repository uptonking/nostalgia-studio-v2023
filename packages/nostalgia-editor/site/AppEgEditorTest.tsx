import * as React from 'react';

import Editor from '../src/nostalgia-editor';

export function AppEgEditorTest() {
  return (
    <div style={{ padding: `28px`, border: `1px solid silver` }}>
      {/* <Editor /> */}
      <Editor
        defaultValue={`# hello,1
- a
- b
- c
      `}
      />
    </div>
  );
}

export default AppEgEditorTest;
