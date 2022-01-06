import * as React from 'react';
import { Key, useMemo, useRef } from 'react';

import { usePress } from '@react-aria/interactions';
import {
  useSelectableCollection,
  useSelectableItem,
} from '@react-aria/selection';
import { useTreeState } from '@react-stately/tree';
import type { Collection, Node } from '@react-types/shared';

export function Tree(props) {
  let state = useTreeState(props);
  let ref = useRef();

  console.log(';;/tree-collection, ', state.collection);
  return (
    <div
      // style={{ backgroundColor: "beige" }}
      // {...collectionProps}
      ref={ref}
      role='tree'
    >
      {createTreeNodes({ nodes: state.collection, state })}
    </div>
  );
}

function createTreeNodes({ nodes, state }) {
  return Array.from(nodes).map((node, index) => {
    console.log('createTreeNodes-cur, ', node);
    return (
      <TreeItem node={node} key={(node as Node<object>).key} state={state} />
    );
  });
}

function TreeItem({ node, state }) {
  let ref = useRef();

  let { itemProps } = useSelectableItem({
    key: node.key,
    selectionManager: state.selectionManager,
    ref: ref,
  });

  let { pressProps } = usePress({
    ...itemProps,
    onPress: () => state.toggleKey(node.key),
  });

  let isExpanded = node.hasChildNodes && state.expandedKeys.has(node.key);
  let isSelected = state.selectionManager.isSelected(node.key);

  const titleStyle = isExpanded ? { backgroundColor: 'beige' } : {};
  return (
    <div
      {...pressProps}
      aria-expanded={node.hasChildNodes ? isExpanded : null}
      aria-selected={isSelected}
      ref={ref}
      role='treeitem'
    >
      <div className='title' style={titleStyle}>
        {node.rendered}
      </div>
      {isExpanded && (
        <div className='children' style={{ marginLeft: 16 }} role='group'>
          {createTreeNodes({ nodes: node.childNodes, state })}
        </div>
      )}
    </div>
  );
}
