import React from 'react';

import cx from 'clsx';
import { useSlate } from 'slate-react';

import { css } from '@linaria/core';

import { themed } from '../../../styles';
import { DraggableCollapsibleEditor } from '../../draggable-collapsible-feature/collapsible-editor';
import { collapseElement } from '../../draggable-collapsible-feature/commands/collapse-element';
import { ElementProps } from '../../types';
import { checkItem } from '../commands';
import {
  getBulletedPointerContent,
  getNumberedPointerContent,
} from '../get-pointer-content';
import type { ListItemElement } from '../types';
import {
  isBulletedListItemElement,
  isCheckboxListItemElement,
  isNumberedListItemElement,
} from '../utils';
import { listItemDefaultCss } from './list-item.styles';

export const ListItem = (
  props: ElementProps & { element: ListItemElement },
) => {
  const editor = useSlate();

  const { children, attributes, element } = props;
  const { depth, listType } = element;

  return (
    <div
      {...attributes}
      className={cx('nos-elem', 'list-item', `list-item-${listType}`)}
    >
      {isBulletedListItemElement(element) ? (
        <button
          contentEditable={false}
          className={cx('pointer', 'clipboardSkip')}
        >
          {getBulletedPointerContent(depth)}
        </button>
      ) : null}
      {isNumberedListItemElement(element) ? (
        <NumberedPointer element={element} />
      ) : null}
      {isCheckboxListItemElement(element) ? (
        <div contentEditable={false} className='pointer clipboardSkip'>
          <input
            type='checkbox'
            checked={Boolean(element.checked)}
            onChange={(e) => checkItem(editor, element, e.target.checked)}
            className='checkbox-pointer'
          />
        </div>
      ) : null}
      <div className={listItemContentCss}>{children}</div>
    </div>
  );
};

/** preceding number of ordered list  */
const NumberedPointer = (props: { element: ListItemElement }) => {
  // useSlate to rerender pointer content (index) when this element isn't changed directly
  const editor = useSlate();

  const { element } = props;
  const { depth } = element;

  const semanticNode = DraggableCollapsibleEditor.semanticNode(element);
  const { listIndex } = semanticNode;

  return (
    <button contentEditable={false} className='pointer clipboardSkip'>
      {getNumberedPointerContent(depth, listIndex) + '.'}
    </button>
  );
};

// const listItemCss=css`

// `;
// const listItemCss=css`

// `;
// const listItemCss=css`

// `;
// const listItemCss=css`

// `;
// const listItemCss=css`

// `;
// const listItemCss=css`

// `;

/** 👀 a trick to show cursor when clicking in zero-width string */
const listItemContentCss = css`
  min-width: 1px;
`;
