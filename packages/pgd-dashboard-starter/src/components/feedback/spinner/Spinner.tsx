import './index.scss';

import * as React from 'react';

export function Spinner() {
  return (
    <div className='fallback-spinner'>
      <div className='loading component-loader'>
        <div className='effect-1 effects'></div>
        <div className='effect-2 effects'></div>
        <div className='effect-3 effects'></div>
      </div>
    </div>
  );
}

export default Spinner;
