import React from 'react';

import { FixedSizeList as List } from 'react-window';

import { listCss, listItemCss, listItemEvenCss } from './styles';

const Row = ({ index, style }) => (
  <div
    className={listItemCss + ' ' + (index % 2 ? '' : listItemEvenCss)}
    style={style}
  >
    Row {index}
  </div>
);

export const A1b1ListFixedSize = () => (
  <List
    className={listCss}
    height={320}
    itemCount={1000}
    itemSize={35}
    width={300}
  >
    {Row}
  </List>
);
