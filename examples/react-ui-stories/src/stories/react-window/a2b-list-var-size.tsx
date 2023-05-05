import React from 'react';

import { VariableSizeList as List } from 'react-window';

import { listCss, listItemCss, listItemEvenCss } from './styles';

// These row heights are arbitrary.
// Yours should be based on the content of the row.
const rowSizes = new Array(1000)
  .fill(true)
  .map(() => 25 + Math.round(Math.random() * 50));

const getItemSize = (index) => rowSizes[index];

const Row = ({ index, style }) => (
  <div
    className={listItemCss + ' ' + (index % 2 ? '' : listItemEvenCss)}
    style={style}
  >
    Row {index}
  </div>
);

export const A2b1ListVarSize = () => (
  <List
    className={listCss}
    height={320}
    itemCount={1000}
    itemSize={getItemSize}
    width={300}
  >
    {Row}
  </List>
);
