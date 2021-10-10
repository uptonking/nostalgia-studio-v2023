import * as React from 'react';

import Editor from '../../src/nostalgia-editor';
import EditorWithEmbed from '../AppEgEditorEmbed';
import * as egEditorDefaultProps from './eg-editor-variants-default-props';

const StoryEditor = (props) => (
  <div style={{ padding: `8px`, border: `1px solid silver` }}>
    <EditorWithEmbed {...props} />
  </div>
);

export function EditorStorybook(props) {
  return (
    <div>
      <blockquote>每个示例都是一个单独的Editor</blockquote>
      {Object.keys(egEditorDefaultProps).map((story) => (
        <div key={egEditorDefaultProps[story]['storyTitle']}>
          <h1>eg: {egEditorDefaultProps[story]['storyTitle']}</h1>
          <StoryEditor {...egEditorDefaultProps[story]} />
        </div>
      ))}
    </div>
  );
}

export function StoryTest(props) {
  // const name = 'ImagesArgs';
  const name = 'CodeBlockOjsArgs';
  return (
    <React.Fragment>
      <h1>{egEditorDefaultProps[name]['storyTitle']}</h1>
      <Editor {...egEditorDefaultProps[name]} />
    </React.Fragment>
  );
}

// export default EditorStorybook;
export default StoryTest;
