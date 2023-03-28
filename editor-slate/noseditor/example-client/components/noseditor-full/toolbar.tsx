import React, { MouseEvent, useEffect, useState } from 'react';

import { type Editor } from 'slate';
import { useSlateStatic } from 'slate-react';

import {
  Code as CodeIcon,
  DownOne as TriangleDownIcon,
  Link as LinkIcon,
  ListCheckbox as ListCheckboxIcon,
  OrderedList as ListOrderedIcon,
  RightOne as TriangleRightIcon,
  Strikethrough as StrikethroughIcon,
  TextBold as BoldIcon,
  TextItalic as ItalicIcon,
  TextUnderline as UnderlineIcon,
  UnorderedList as ListUnorderedIcon,
} from '@icon-park/react';
import type { Icon } from '@icon-park/react/lib/runtime';

import { IconButton } from '../../../src';
import {
  Heading1Spec,
  Heading2Spec,
  Heading3Spec,
} from '../../../src/plugins/heading/utils';
import { insertLink, unwrapLinks } from '../../../src/plugins/link/transforms';
import { toggleList } from '../../../src/plugins/list/transforms';
import { ListTypes } from '../../../src/plugins/list/utils';
import { TextFormats } from '../../../src/plugins/marks/types';
import { ParagraphSpec } from '../../../src/plugins/paragraph/utils';
import { toggleElement, toggleMark } from '../../../src/transforms';

type ToolbarConfigType = {
  type: 'button' | 'dropdown' | 'listbox';
  icon: Icon;
  format?: TextFormats;
  list?: typeof ListTypes[keyof typeof ListTypes];
  link?: 'link';
  title: string;
};

const editorFormatHandler =
  (editor: Editor, format: TextFormats) =>
  (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    toggleMark(editor, format);
  };

const listToggleHandler =
  (editor: Editor, list: typeof ListTypes[keyof typeof ListTypes]) =>
  (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toggleList(editor, { listType: list });
  };

const toolbarActionsData: ToolbarConfigType[] = [
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
    icon: StrikethroughIcon,
    format: 'strikethrough',
    title: 'toggle strikethrough',
  },
  {
    type: 'button',
    icon: CodeIcon,
    format: 'code',
    title: 'toggle text as code',
  },
  {
    type: 'button',
    icon: ListUnorderedIcon,
    list: ListTypes.Bulleted,
    title: 'toggle bullet list',
  },
  {
    type: 'button',
    icon: ListOrderedIcon,
    list: ListTypes.Numbered,
    title: 'toggle ordered list',
  },
  {
    type: 'button',
    icon: ListCheckboxIcon,
    list: ListTypes.TodoList,
    title: 'toggle checkbox list',
  },
  {
    type: 'button',
    icon: LinkIcon,
    link: 'link',
    title: 'toggle link',
  },
];

export const NosToolbar = () => {
  const editor = useSlateStatic();

  return (
    <div className='nosedit-toolbar'>
      {toolbarActionsData.map(
        ({ type, icon: Icon, format, list, link, title }) => {
          if (type === 'button') {
            if (format) {
              return (
                <IconButton
                  onMouseDown={editorFormatHandler(editor, format)}
                  key={title}
                >
                  <Icon title={title} />
                </IconButton>
              );
            }
            if (list) {
              return (
                <IconButton
                  onMouseDown={listToggleHandler(editor, list)}
                  key={title}
                >
                  <Icon title={title} />
                </IconButton>
              );
            }
            if (link) {
              return (
                <IconButton
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const url = prompt('Link URL: ');

                    if (url) {
                      insertLink(editor, url);
                    }
                  }}
                  key={title}
                >
                  <Icon title={title} />
                </IconButton>
              );
            }
          }

          return null;
        },
      )}

      {/* <div>


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
