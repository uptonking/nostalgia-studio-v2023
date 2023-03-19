import './styles.scss';

import React from 'react';

import cx from 'classnames';
import { useSlate, useSlateStatic } from 'slate-react';

import { ExtendedEditor } from '../../../slate-extended/extended-editor';
import { foldElement } from '../../../slate-extended/transforms/fold-element';
import { ElementProps } from '../../types';
import {
  getBulletedPointerContent,
  getNumberedPointerContent,
} from '../get-pointer-content';
import { checkTodoItem } from '../transforms';
import { ListItemElement, ListTypes } from '../types';
import { isTodoListItemElement } from '../utils';

export const ListItem = (
  props: ElementProps & { element: ListItemElement },
) => {
  const editor = useSlateStatic();

  const { children, attributes, element } = props;
  const { depth, listType } = element;

  return (
    <div {...attributes} className={cx('list-item', `list-item-${listType}`)}>
      {listType === ListTypes.Bulleted && (
        <button
          contentEditable={false}
          className='pointer clipboardSkip'
        // style={
        //   {
        //     '--pointer-content': `"${getBulletedPointerContent(depth)}"`,
        //   } as React.CSSProperties
        // }
        // onMouseDown={() => {
        //   foldElement(editor, element);
        // }}
        >
          {getBulletedPointerContent(depth)}
        </button>
      )}
      {listType === ListTypes.Numbered ? (
        <NumberedPointer element={element} />
      ) : null}
      {isTodoListItemElement(element) ? (
        <div contentEditable={false} className='pointer clipboardSkip'>
          <input
            className='checkbox-pointer'
            type='checkbox'
            checked={Boolean(element.checked)}
            onChange={(e) => checkTodoItem(editor, element, e.target.checked)}
          />
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  );
};

/** ordered list number */
const NumberedPointer = (props: { element: ListItemElement }) => {
  const editor = useSlate(); // useSlate to rerender pointer content (index) when this element isn't changed directly

  const { element } = props;
  const { depth } = element;

  const semanticNode = ExtendedEditor.semanticNode(element);
  const { listIndex } = semanticNode;

  return (
    <button
      contentEditable={false}
      className='pointer clipboardSkip'
    // style={
    //   {
    //     '--pointer-content': `"${getNumberedPointerContent(
    //       depth,
    //       listIndex,
    //     )}"`,
    //   } as React.CSSProperties
    // }
    // onMouseDown={() => {
    //   foldElement(editor, element);
    // }}
    >
      {getNumberedPointerContent(depth, listIndex) + '.'}
    </button>
  );
};

export default ListItem;
