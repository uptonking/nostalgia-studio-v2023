import './index.scss';

import * as React from 'react';

export function LoadingSpinner() {
  return (
    <div className='fallback-spinner'>
      <div className='loading component-loader'>
        <div className='effect-1 effects' />
        <div className='effect-2 effects' />
        <div className='effect-3 effects' />
      </div>
    </div>
  );
}

export default LoadingSpinner;
