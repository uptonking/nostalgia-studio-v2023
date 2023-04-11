import React from 'react';

import { useSlateStatic } from 'slate-react';

import {
  Heading1Spec,
  Heading2Spec,
  Heading3Spec,
} from '../../plugins/heading/utils';
import { insertLink, removeLink } from '../../plugins/link/commands';
import { toggleList } from '../../plugins/list/commands';
import { ListTypes } from '../../plugins/list/utils';
import { ParagraphSpec } from '../../plugins/paragraph/utils';
import { toggleBlock, toggleMark } from '../../transforms';
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  LinkIcon,
  ListCheckboxIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
} from '../icons';

export const EditorToolbar = () => {
  const editor = useSlateStatic();

  return (
    <div
      style={{
        marginBottom: 18,
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(editor, ParagraphSpec);
          }}
          className='toolbar-button'
        >
          P
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(editor, Heading1Spec);
          }}
          className='toolbar-button'
        >
          H1
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(editor, Heading2Spec);
          }}
          className='toolbar-button'
        >
          H2
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(editor, Heading3Spec);
          }}
          className='toolbar-button'
        >
          H3
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleList(editor, { listType: ListTypes.Bulleted });
          }}
          className='toolbar-button'
        >
          <ListUnorderedIcon />
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleList(editor, { listType: ListTypes.Numbered });
          }}
          className='toolbar-button'
        >
          <ListOrderedIcon />
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleList(editor, { listType: ListTypes.TodoList });
          }}
          className='toolbar-button'
        >
          <ListCheckboxIcon />
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt('Link URL: ');

            if (url) {
              insertLink(editor, url);
            }
          }}
          className='toolbar-button'
        >
          <LinkIcon />
        </button>

        <button
          style={{ position: 'relative' }}
          onMouseDown={(e) => {
            e.preventDefault();
            removeLink(editor);
          }}
          className='toolbar-button'
        >
          <LinkIcon />
          <span
            style={{
              position: 'absolute',
              bottom: -2,
              right: 5,
              fontSize: 10,
              color: 'tomato',
            }}
          >
            x
          </span>
        </button>
      </div>

      <div>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor, 'bold');
          }}
          className='toolbar-button'
        >
          <BoldIcon />
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor, 'italic');
          }}
          className='toolbar-button'
        >
          <ItalicIcon />
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor, 'code');
          }}
          className='toolbar-button'
        >
          <CodeIcon />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor, 'underline');
          }}
          className='toolbar-button'
        >
          U̲
        </button>
      </div>
    </div>
  );
};
