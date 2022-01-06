import * as React from 'react';

import { Item } from '@react-stately/collections';

import { Tree } from '../src/TreeView';

export function SimpleStaticTree(props = {}) {
  return (
    <Tree {...props}>
      <Item key='A1' title='Animals'>
        <Item>Aardvark</Item>
        <Item title='Bear'>
          <Item>Black Bear</Item>
          <Item>Brown Bear</Item>
        </Item>
        <Item>Kangaroo</Item>
        <Item>Snake</Item>
      </Item>
      <Item key='A2' title='Fruits'>
        <Item>Apple</Item>
        <Item>Orange</Item>
        <Item title='Kiwi'>
          <Item>Golden Kiwi</Item>
          <Item>Fuzzy Kiwi</Item>
        </Item>
      </Item>
    </Tree>
  );
}
