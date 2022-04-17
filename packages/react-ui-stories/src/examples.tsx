import React, { useState } from 'react';

import * as stories from './dnd-kit';

const storiesNames = Object.keys(stories);

export function ExamplesApp() {
  const [currentStory, setCurrentStory] = useState(storiesNames[0]);

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
            // 如果设置overflowX为hidden，窄屏幕上这个toc菜单会全部隐藏
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
            // maxWidth: '1100px',
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
