import React, { useCallback, useMemo } from 'react';
import {
  Descendant,
  Editor,
  Element as SlateElement,
  Transforms,
  createEditor,
} from 'slate';
import { Editable, Slate, useSlate, withReact } from 'slate-react';

import { Button, Icon, Toolbar } from '../../components';
import { isMarkActive, toggleMark, isBlockActive, TEXT_ALIGN_TYPES, toggleBlock } from './utils';

export const RTEToolbar = () => {
  return (
    <Toolbar>
      <MarkButton format='bold' icon='format_bold' />
      <MarkButton format='italic' icon='format_italic' />
      <MarkButton format='underline' icon='format_underlined' />
      <MarkButton format='code' icon='code' />
      <BlockButton format='heading-one' icon='looks_one' />
      <BlockButton format='heading-two' icon='looks_two' />
      <BlockButton format='block-quote' icon='format_quote' />
      <BlockButton format='numbered-list' icon='format_list_numbered' />
      <BlockButton format='bulleted-list' icon='format_list_bulleted' />
      <BlockButton format='left' icon='format_align_left' />
      <BlockButton format='center' icon='format_align_center' />
      <BlockButton format='right' icon='format_align_right' />
      <BlockButton format='justify' icon='format_align_justify' />
    </Toolbar>
  );
};

export const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};


const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type',
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
