import { Button, List, Space, Spin, Typography } from 'antd';
import dompurify from 'dompurify';
import React from 'react';

import Editor from '../../../src/nostalgia-editor';
import { INote } from '../../common/types';
import KeyCommandTooltip from '../KeyCommandTooltip';
import Page from '../Page';

// import Editor from 'rich-markdown-editor';
// import moment from 'moment';

const sanitizer = dompurify.sanitize;

interface INotesProps {
  notes: INote[];
  isLoading: boolean;
  activeNote?: string;
  selectedNotes: string[];
  isAuthenticated?: boolean;
  onNoteClick: (id: string) => void;
  onMouseEnter: (id: string) => void;
  createNote: () => void;
  login: () => void;
}

/**
 * 默认的主页，采用左右双栏布局，笔记列表 + 预览f
 */
export default function Notes({
  notes,
  login,
  activeNote,
  isLoading,
  createNote,
  onNoteClick,
  onMouseEnter,
  selectedNotes,
  isAuthenticated,
}: INotesProps) {
  const currentNote = notes.find((note) => note._id === activeNote);

  return (
    <Page
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
            {currentNote?.title && (
              <h1 dangerouslySetInnerHTML={{ __html: currentNote?.title }}></h1>
            )}
            <Editor
              defaultValue={currentNote?.body || ' '}
              value={currentNote?.body || ' '}
              className='markdown'
              onChange={() => {}}
              readOnly={false}
            />
          </div>

          {/* <ContextFooter /> */}
        </div>
      }
    >
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <Space
          align='center'
          style={{
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            width: '100%',
          }}
        >
          <Space align='center' size={10}>
            <img
              src='https://res.cloudinary.com/albin-groen/image/upload/v1598347221/keyboardnotes-logo_vsebhn.png'
              style={{ maxWidth: 25 }}
              alt='Keyboardnotes logo'
            />

            <Typography.Title
              style={{ margin: 0, padding: 0, lineHeight: 1 }}
              level={5}
            >
              All notes
            </Typography.Title>
          </Space>

          {isAuthenticated ? (
            <KeyCommandTooltip command='c'>
              <Button onClick={createNote}>New note</Button>
            </KeyCommandTooltip>
          ) : (
            <Space align='center'>
              <KeyCommandTooltip command='c'>
                <Button onClick={createNote}>New note</Button>
              </KeyCommandTooltip>
              {!isAuthenticated && (
                <KeyCommandTooltip command='cmd/ctrl+k'>
                  <Button type='primary' onClick={login}>
                    Log in / Sign up
                  </Button>
                </KeyCommandTooltip>
              )}
            </Space>
          )}
        </Space>
        {isLoading || !notes.length ? (
          <>
            {isLoading ? (
              <Spin />
            ) : (
              <Typography.Text style={{ textAlign: 'center' }}>
                Hit <Typography.Text keyboard>c</Typography.Text>
                to create a new note
              </Typography.Text>
            )}
          </>
        ) : (
          notes.map((note) => {
            const isSelected = selectedNotes.includes(note._id);
            const isActive = note._id === activeNote;

            return (
              <List.Item
                key={note._id}
                onClick={() => onNoteClick(note._id)}
                onMouseEnter={() => onMouseEnter(note._id)}
                style={{
                  border: 'none',
                  borderLeft: '4px solid white',
                  background: isSelected
                    ? '#54acdc'
                    : isActive
                      ? '#f4f6fb'
                      : 'white',
                  borderLeftColor: isSelected
                    ? isActive
                      ? 'white'
                      : '#54acdc'
                    : isActive
                      ? '#aeb1dd'
                      : 'white',
                  cursor: 'pointer',
                  padding: '0.5rem 2rem',
                  paddingLeft: 'calc(2rem - 4px)',
                }}
              >
                <p
                  style={{
                    color: isSelected ? 'white' : 'inherit',
                    fontWeight: 500,
                    margin: 0,
                    padding: 0,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(note.title),
                  }}
                />
                <Typography.Text
                  style={{ color: isSelected ? 'white' : '#888' }}
                  type='secondary'
                >
                  {
                    // moment(note.createdAt).format('DD MMM HH:mm')
                    note.createdAt
                  }
                </Typography.Text>
              </List.Item>
            );
          })
        )}
      </div>
    </Page>
  );
}
