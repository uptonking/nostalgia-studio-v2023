import './style.css';

import React, { useCallback, useRef, useState } from 'react';

import {
  Menu,
  MenuImperativeHandle,
  MenuItem,
  MenuOrientation,
  MenuProps,
  useMenu,
  useMenuItem,
} from '../../src';

const numbers = '-'
  .repeat(100)
  .split('')
  .map((_, idx) => idx);

const largeList = '-'
  .repeat(1_000_000)
  .split('')
  .map((_, idx) => idx);

const strings = [
  'Apple',
  'Banana',
  'Blueberry',
  'Brownies',
  'Chowder',
  'Lemon',
  'Mac and Cheese',
  'Orange',
  'Ravioli',
  'Smash Burger',
  'Strawberry',
];

// const listActionHandlers: Pick<MenuProps, 'onSelectItem' | 'onFocusItem'> = {
//   onFocusItem: action('onFocusItem'),
//   onSelectItem: action('onSelectItem'),
// };

export const MinimalListApp = () => (
  <Menu
    // {...listActionHandlers}
    renderMenu={({ props, ref }) => (
      <div className='list' ref={ref} {...props}>
        <MenuItem<HTMLButtonElement>
          renderItem={({ props, ref }) => (
            <button {...props} ref={ref} className='item'>
              Apple
            </button>
          )}
        />
        <MenuItem<HTMLButtonElement>
          renderItem={({ props, ref }) => (
            <button {...props} ref={ref} className='item'>
              Orange
            </button>
          )}
        />
        <MenuItem<HTMLButtonElement>
          renderItem={({ props, ref }) => (
            <button {...props} ref={ref} className='item'>
              Strawberry
            </button>
          )}
        />
        <MenuItem<HTMLButtonElement>
          renderItem={({ props, ref }) => (
            <button {...props} ref={ref} className='item'>
              Blueberry
            </button>
          )}
        />
      </div>
    )}
  />
);

export const MinimalHooksListApp = () => {};

export const LotsOfItems = () => (
  <Menu
    renderMenu={({ props, ref }) => (
      <div className='list' ref={ref} {...props}>
        {numbers.map((item) => (
          <MenuItem<HTMLButtonElement>
            key={item}
            id={item}
            renderItem={({ props, ref }) => (
              <button {...props} ref={ref} className='item'>
                Item {item}
              </button>
            )}
          />
        ))}
      </div>
    )}
  />
);

export const LotsOfItemsWithinContainer = () => {
  return (
    <div>
      {/* 👀️ 注意此处不能使用maxHeight，否则内容高度都会显示出来，parent的hidden就不符合预期了 */}
      {/* <div style={{ width: 480, maxHeight: 360 }}> */}
      <div style={{ width: 480, height: 360 }}>
        <div className='eg-scroll-parent '>
          <div className='eg-scroll-child '>
            <Menu
              renderMenu={({ props, ref }) => (
                <div className='list' ref={ref} {...props}>
                  {numbers.map((item) => (
                    <MenuItem<HTMLButtonElement>
                      key={item}
                      id={item}
                      renderItem={({ props, ref }) => (
                        <button {...props} ref={ref} className='item'>
                          Item {item}
                        </button>
                      )}
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
