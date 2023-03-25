import React, { memo, useEffect, useReducer, useState } from 'react';

import cx from 'clsx';
import { Element } from 'slate';
import { useSlate } from 'slate-react';

import {
  TriangleDownIcon,
  TriangleRightIcon,
} from '../../../../components/icons';
import { ExtendedEditor } from '../../../../slate-extended/extended-editor';

type Props = {
  onFold?: React.MouseEventHandler;
  classes?: string;
};

export const FoldingArrow = (props: Props & { element: Element }) => {
  const forceRerender = useReducer(() => ({}), {})[1];
  const editor = useSlate();
  const { element, onFold, classes } = props;

  useEffect(() => {
    forceRerender();
  }, [editor.children]);

  if (
    ExtendedEditor.isFoldingElement(editor, element) &&
    ExtendedEditor.semanticNode(element).children.length > 0
  ) {
    return (
      <FoldingArrowMemoized
        folded={Boolean(element.folded)}
        isList={ExtendedEditor.isNestingElement(editor, element)}
        onFold={onFold}
        classes={classes}
      />
    );
  }

  return null;
};

const FoldingArrowMemoized = memo(
  (props: Props & { isList: boolean; folded: boolean }) => {
    const { isList, folded, onFold, classes } = props;

    return (
      <button
        contentEditable={false}
        className={cx('folding', 'clipboardSkip', classes, {
          'folding-list': isList,
          folded: folded,
        })}
        onMouseDown={(e) => {
          e.preventDefault();
          if (onFold) onFold(e);
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

export default FoldingArrow;
