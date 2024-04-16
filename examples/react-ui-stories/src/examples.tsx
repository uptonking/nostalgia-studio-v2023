import React, { useState } from 'react';

import * as stories from './stories/tanstack-table';
// import * as stories from './stories/autocomplete';
// import * as stories from './stories/tanstack-virtual';
// import * as stories from './stories/dnd-kit';
// import * as stories from './stories/dnd-use-gesture';

// import * as stories from './stories/react-window';
// import * as stories from './stories/react-tiny-virtual-list';
// import * as stories from './stories/reactjs-popup';

const storiesNames = Object.keys(stories);
// console.log(';; stories ', stories)

export function ExamplesApp() {
  const [currentStory, setCurrentStory] = useState(storiesNames[0]);
  // const [currentStory, setCurrentStory] = useState('A5t1LazyList');

  const CurrentExampleComponent = currentStory
    ? stories[currentStory]
    : () => <h4>未选择示例</h4>;

  return (
    <div>
      <h1>examples for react stories</h1>
      <h2>当前示例: {currentStory}</h2>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: 200,
            // padding: '8px',
            // overflowX: 'hidden',
            backgroundColor: 'beige',
          }}
          className='left-toc-placeholder'
        >
          {storiesNames.map((name, index) => (
            <div onClick={() => setCurrentStory(name)} key={index + name}>
              <h5 style={{ cursor: 'pointer' }}>{name}</h5>
            </div>
          ))}
        </div>
        <div
          style={{
            flexGrow: 1,
            // maxWidth: '1100px',
            height: '100%',
            margin: '8px',
            // backgroundColor: 'lightyellow',
          }}
          className='right-comp-placeholder'
        >
          <CurrentExampleComponent />
        </div>
      </div>
    </div>
  );
}
