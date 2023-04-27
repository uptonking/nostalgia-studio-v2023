import React from 'react';

import { DndTree } from './dnd-tree';

const EgContainer = ({ children }) => (
  <div style={{ minWidth: 360, maxWidth: 720 }}>{children}</div>
);

export const DndTreeApp = () => {
  return (
    <EgContainer>
      <DndTree
        // isCollapsible={false}
        // isRemovable={false}
        showDropIndicator={true}
      />
    </EgContainer>
  );
};

export const TreeUpdateOnDrop = () => {
  return (
    <EgContainer>
      <DndTree
        // isCollapsible={false}
        // isRemovable={false}
        showDropIndicator={true}
        retainLayoutWhenDragging={true}
      />
    </EgContainer>
  );
};
