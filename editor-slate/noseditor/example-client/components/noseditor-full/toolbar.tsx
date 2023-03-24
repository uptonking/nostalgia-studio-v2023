import React, { MouseEvent, useEffect, useState } from 'react';

import { useSlateStatic } from 'slate-react';

import {
  Code as CodeIcon,
  DownOne as TriangleDownIcon,
  Drag as DragIcon,
  Link as LinkIcon,
  ListCheckbox as ListUnorderedIcon,
  OrderedList as ListOrderedIcon,
  RightOne as TriangleRightIcon,
  TextBold as BoldIcon,
  TextItalic as ItalicIcon,
  TextUnderline as UnderlineIcon,
  UnorderedList as ListCheckboxIcon,
} from '@icon-park/react';

import {
  Heading1Spec,
  Heading2Spec,
  Heading3Spec,
} from '../../../src/plugins/heading/utils';
import { insertLink, unwrapLinks } from '../../../src/plugins/link/transforms';
import { toggleList } from '../../../src/plugins/list/transforms';
import { ListTypes } from '../../../src/plugins/list/utils';
import { ParagraphSpec } from '../../../src/plugins/paragraph/utils';
import { toggleElement, toggleMark } from '../../../src/transforms';
import { IconButton } from '../common/icon-button';

const editorFormatHandler =
  (editor, format) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    toggleMark(editor, format);
  };

const toolbarActionsData = [
  {
    type: 'button',
    icon: BoldIcon,
    format: 'bold',
    title: 'toggle bold',
  },
  {
    type: 'button',
    icon: ItalicIcon,
    format: 'italic',
    title: 'toggle italic',
  },
  {
    type: 'button',
    icon: UnderlineIcon,
    format: 'underline',
    title: 'toggle underline',
  },
  {
    type: 'button',
    icon: CodeIcon,
    format: 'code',
    title: 'toggle text as code',
  },
];

export const NosToolbar = () => {
  const editor = useSlateStatic();

  return (
    <div className='nosedit-toolbar'>
      {toolbarActionsData.map(({ type, icon: Icon, format, title }) => {
        if (type === 'button') {
          return (
            <IconButton
              onMouseDown={editorFormatHandler(editor, format)}
              title={title}
              key={title}
            >
              <Icon title={title} />
            </IconButton>
          );
        }
        return null;
      })}

      {/* <div>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleElement(editor, ParagraphSpec);
          }}
          className='toolbar-button'
        >
          P
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleElement(editor, Heading1Spec);
          }}
          className='toolbar-button'
        >
          H1
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleElement(editor, Heading2Spec);
          }}
          className='toolbar-button'
        >
          H2
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            toggleElement(editor, Heading3Spec);
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
            unwrapLinks(editor);
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
      </div> */}
    </div>
  );
};
