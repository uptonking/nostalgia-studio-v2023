import React, { useState } from 'react';

import ExpandIcon from '../../icons/expand.svg';
import { toggleTodoItem } from '../../store/notesStore';
import { type TodoItem } from '../../types';
import { Checkbox } from '../Common/Checkbox/Checkbox';
import { ExpandToggle, ListItemWrapper } from './TodoItemComponent.styled';

type TodoItemComponentProps = {
  item: TodoItem;
  indent: number;
  noteId: string;
};
export const TodoItemComponent: React.FC<TodoItemComponentProps> = ({
  item,
  indent,
  noteId,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => {
    toggleTodoItem(noteId, item.id);
  };

  return (
    <>
      <ListItemWrapper $indent={indent}>
        <Checkbox
          checked={item.isDone}
          onToggle={handleToggle}
          label={item.text}
          id={item.id}
        />
        {item.children && (
          <ExpandToggle
            $expanded={isExpanded}
            onClick={() => setIsExpanded((prevState) => !prevState)}
          >
            <img src={ExpandIcon} width={24} height={24} />
          </ExpandToggle>
        )}
      </ListItemWrapper>
      {isExpanded &&
        item.children?.map((subItem) => (
          <TodoItemComponent
            key={subItem.id}
            item={subItem}
            indent={indent + 1}
            noteId={noteId}
          />
        ))}
    </>
  );
};
