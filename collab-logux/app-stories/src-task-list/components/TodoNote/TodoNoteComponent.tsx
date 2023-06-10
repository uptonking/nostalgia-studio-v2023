import React, { useState } from 'react';

import ArrowIcon from '../../icons/arrow.svg';
import { type TodoNote } from '../../types';
import { TodoItemComponent } from '../TodoItem/TodoItemComponent';
import {
  ArrowContainer,
  ContentContainer,
  FoldedNote,
  HeaderContainer,
  NoteWrapper,
  Pin,
} from './TodoNoteComponent.styled';

type TodoNoteComponentProps = {
  note: TodoNote;
};

export const TodoNoteComponent: React.FC<TodoNoteComponentProps> = ({
  note,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <NoteWrapper $expanded={isExpanded}>
      <HeaderContainer>
        <Pin $side={'left'} />
        <div className={'title'}>{note.title}</div>
        <Pin $side={'right'} />
      </HeaderContainer>
      {isExpanded && (
        <>
          <ContentContainer>
            {note.items?.map((item) => (
              <TodoItemComponent
                item={item}
                key={item.id}
                indent={0}
                noteId={note.id}
              />
            ))}
          </ContentContainer>
          <ArrowContainer>
            <img
              src={ArrowIcon}
              width={24}
              height={24}
              onClick={() => setIsExpanded(false)}
            />
          </ArrowContainer>
        </>
      )}
      {!isExpanded && <FoldedNote onClick={() => setIsExpanded(true)} />}
    </NoteWrapper>
  );
};
