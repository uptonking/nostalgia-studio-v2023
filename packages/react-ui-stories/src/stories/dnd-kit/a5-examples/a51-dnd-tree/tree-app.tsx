import React from 'react';

import { DndTree } from './dnd-tree';

export const TreeApp = () => {
  return (
    <div style={{ minWidth: 360, maxWidth: 720 }}>
      <DndTree collapsible removable />
    </div>
  );
};
