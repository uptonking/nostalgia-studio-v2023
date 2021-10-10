import { Button, Divider, Space } from 'antd';
import React, { useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Link } from 'react-router-dom';

import Editor from '../../../src/nostalgia-editor';
import { INote } from '../../common/types';
import KeyCommandTooltip from '../KeyCommandTooltip';
import Page from '../Page';

// import Editor from 'rich-markdown-editor';

interface INoteProps {
  notes: INote[];
  value?: string;
  valueTitle?: string;
  onChange: (e: string) => void;
  onChangeTitle: (value: string) => void;
  onClickNextNote: () => void;
  onClickPreviousNote: () => void;
  setIsTyping: (value: boolean) => void;
}

/**
 * 笔记编辑器的布局与样式
 */
export default function Note({
  value: defaultValue,
  valueTitle,
  onChange,
  notes,
  onChangeTitle,
  onClickNextNote,
  onClickPreviousNote,
  setIsTyping,
}: INoteProps) {
  const [value, setValue] = useState(defaultValue);
  const text = useRef<any>(valueTitle);

  if (text.current === undefined) {
    text.current = valueTitle;
  }

  return (
    <Page
      left={
        <div
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <div style={{ flex: 1, marginBottom: '3rem' }}>
            <Space>
              <KeyCommandTooltip command='esc'>
                <Link to='/'>
                  <Button>All notes</Button>
                </Link>
              </KeyCommandTooltip>

              {notes.length > 1 && (
                <Space>
                  <KeyCommandTooltip command='ctrl+j'>
                    <Button onClick={onClickNextNote}>Next</Button>
                  </KeyCommandTooltip>

                  <KeyCommandTooltip command='ctrl+k'>
                    <Button onClick={onClickPreviousNote}>Previous</Button>
                  </KeyCommandTooltip>
                </Space>
              )}
            </Space>
          </div>
        </div>
      }
      right={
        <div
          style={{
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <div style={{ flex: 1, marginBottom: '3rem' }}>
            {valueTitle && (
              <h1 dangerouslySetInnerHTML={{ __html: valueTitle }}></h1>
            )}
            <Editor
              className='markdown'
              defaultValue={value || ' '}
              value={value || ' '}
              // readOnlyWriteCheckboxes
              onChange={(v) => {
                const newValue = v();
                const trimmedNewValue = newValue.substr(0, newValue.length - 4);

                setValue(trimmedNewValue);
                onChange(trimmedNewValue);
              }}
              readOnly={false}
            />
          </div>

          {/* <ContextFooter /> */}
        </div>
      }
    >
      <div
        style={{
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
          padding: '2rem',
        }}
      >
        <ContentEditable
          tagName='h1'
          className='note-heading'
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onFocus={(e) => document.execCommand('selectAll', false)}
          html={text.current || ''}
          onChange={(e) => {
            onChangeTitle(e.target.value);
            text.current = e.target.value;
          }}
        />

        <Divider />

        <textarea
          style={{ flex: 1, width: '100%', border: 'none', fontSize: '1.1em' }}
          placeholder='Start jotting down your thoughts (markdown is supported)'
          onChange={(e) => {
            const newValue = e.currentTarget.value;
            setValue(newValue);
            onChange(newValue);
          }}
          onBlur={() => setIsTyping(false)}
          onFocus={() => setIsTyping(true)}
          value={value}
          autoFocus
        />
      </div>
    </Page>
  );
}
