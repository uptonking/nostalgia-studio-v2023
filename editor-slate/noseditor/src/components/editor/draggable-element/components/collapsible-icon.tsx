import React, { memo, useEffect, useReducer, useState } from 'react';

import cx from 'clsx';
import { Element } from 'slate';
import { useSlate } from 'slate-react';

import { TriangleDownIcon, TriangleRightIcon } from '../../..';
import { DraggableCollapsibleEditor } from '../../../../plugins';

type CollapsibleIconProps = {
  onCollapse?: React.MouseEventHandler;
  classes?: string;
};

export const CollapsibleIcon = (
  props: CollapsibleIconProps & { element: Element },
) => {
  const forceRerender = useReducer(() => ({}), {})[1];
  const editor = useSlate() as DraggableCollapsibleEditor;
  const { element, onCollapse, classes } = props;

  useEffect(() => {
    forceRerender();
  }, [editor.children, forceRerender]);

  if (
    DraggableCollapsibleEditor.isCollapsibleElement(editor, element) &&
    DraggableCollapsibleEditor.semanticNode(element).children.length > 0
  ) {
    return (
      <CollapsibleIconMemoized
        folded={Boolean(element.folded)}
        isList={DraggableCollapsibleEditor.isNestableElement(editor, element)}
        onCollapse={onCollapse}
        classes={classes}
      />
    );
  }

  return null;
};

const CollapsibleIconMemoized = memo(
  (props: CollapsibleIconProps & { isList: boolean; folded: boolean }) => {
    const { isList, folded, onCollapse, classes } = props;

    return (
      <button
        contentEditable={false}
        className={cx('folding', 'clipboardSkip', classes, {
          'folding-list': isList,
          folded: folded,
        })}
        onMouseDown={(e) => {
          e.preventDefault();
          if (onCollapse) onCollapse(e);
        }}
      >
        <div
          // className={cx({'--rotate': folded ? '0deg' : '90deg'})}
          style={
            {
              '--rotate': folded ? '0deg' : '90deg',
            } as React.CSSProperties
          }
        >
          <TriangleRightIcon />
        </div>
      </button>
    );
  },
);
