import './index.css';

import React, { useState } from 'react';

import * as stories from './stories/tanstack-table';

// import * as stories from './stories/autocomplete';
// import * as stories from './stories/tanstack-virtual';
// import * as stories from './stories/dnd-kit';
// import * as stories from './stories/dnd-use-gesture';

// import * as stories from './stories/react-window';
// import * as stories from './stories/react-tiny-virtual-list';
// import * as stories from './stories/reactjs-popup';

let storiesNames = Object.keys(stories);
// console.log(';; stories ', stories)

if (storiesNames.includes('B1b1PivotTableApp')) {
  storiesNames = [
    'B1b1PivotTableApp',
    ...storiesNames.filter((st) => st !== 'B1b1PivotTableApp'),
  ];
}

export function ExamplesApp() {
  const [currentStory, setCurrentStory] = useState(storiesNames[0]);
  // const [currentStory, setCurrentStory] = useState('A5t1LazyList');

  const CurrentExampleComponent = currentStory
    ? stories[currentStory]
    : () => <h4>未选择示例</h4>;

  return (
    <div>
      <nav className='stori-navbar-container'>
        <h1>examples for react stories</h1>
        <p className='current-stori'> {currentStory}</p>
      </nav>
      <div className='stori-sidebar-container left-toc-placeholder'>
        {storiesNames.map((name, index) => (
          <div
            className={
              'stori-name-item' + (name === currentStory ? ' active' : '')
            }
            onClick={() => setCurrentStory(name)}
            key={index + name}
          >
            <p>{name}</p>
          </div>
        ))}
      </div>
      <div className='stori-app-container right-comp-placeholder'>
        <CurrentExampleComponent />
      </div>
    </div>
  );
}
