import React, { MouseEvent, useEffect, useState } from 'react';

import { type Editor } from 'slate';
import { useSlateStatic } from 'slate-react';

import { IconButton } from '../../../src';
import {
  Heading1Spec,
  Heading2Spec,
  Heading3Spec,
} from '../../../src/plugins/heading/utils';
import { toggleList } from '../../../src/plugins/list/commands';
import { ListTypes } from '../../../src/plugins/list/utils';
import type { TextFormats } from '../../../src/plugins/marks/types';
import { ParagraphSpec } from '../../../src/plugins/paragraph/utils';
import { toggleElement, toggleMark } from '../../../src/transforms';
import { AddLinkPanel } from './add-link-panel';
import { toolbarConfig } from './toolbar-config';

const textFormatHandler =
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

const useShowAddLink = ({ initialShow = false } = {}) => {
  const [showAddLink, setShowAddLink] = useState(initialShow);

  return {
    showAddLink,
    setShowAddLink,
  };
};

export const NosToolbar = () => {
  const editor = useSlateStatic();
  const { showAddLink, setShowAddLink } = useShowAddLink();

  return (
    <div className='nosedit-toolbar'>
      {toolbarConfig.map(({ type, icon: Icon, format, list, link, title }) => {
        if (type === 'button') {
          if (format) {
            return (
              <IconButton
                onMouseDown={textFormatHandler(editor, format)}
                key={title}
                title={title}
              >
                <Icon />
              </IconButton>
            );
          }
          if (list) {
            return (
              <IconButton
                onMouseDown={listToggleHandler(editor, list)}
                key={title}
                title={title}
              >
                <Icon />
              </IconButton>
            );
          }
          if (link) {
            return (
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddLink(true);
                }}
                key={title}
                title={title}
              >
                <Icon />
              </IconButton>
            );
          }
        }
        return null;
      })}
      {showAddLink ? (
        <AddLinkPanel
          showAddLink={showAddLink}
          setShowAddLink={setShowAddLink}
        />
      ) : null}
    </div>
  );
};
