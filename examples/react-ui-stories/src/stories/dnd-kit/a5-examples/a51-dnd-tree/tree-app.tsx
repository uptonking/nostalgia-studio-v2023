import React from 'react';

import { DndTree } from './dnd-tree';

export const DndTreeApp = () => {
  return (
    <div style={{ minWidth: 360, maxWidth: 720 }}>
      <DndTree
        // isCollapsible={false}
        // isRemovable={false}
        showDropIndicator={true}
      />
    </div>
  );
};

export const TreeUpdateOnDrop = () => {
  return (
    <div style={{ minWidth: 360, maxWidth: 720 }}>
      <DndTree
        // isCollapsible={false}
        // isRemovable={false}
        showDropIndicator={true}
        retainLayoutWhenDragging={true}
      />
    </div>
  );
};
