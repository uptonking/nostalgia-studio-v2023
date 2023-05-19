import React from 'react';

import styled from 'styled-components';

import { useStore } from '@nanostores/react';

import { notes as notesAtom } from '../../store/notesStore';
import { TodoNoteComponent } from './TodoNoteComponent';

const NotesWrapper = styled.div``;

export const TodoNotes = () => {
  const notes = useStore(notesAtom);
  return (
    <NotesWrapper>
      {notes.map((note) => (
        <TodoNoteComponent key={note.id} note={note} />
      ))}
    </NotesWrapper>
  );
};
