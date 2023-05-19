import { v4 as uuidv4 } from 'uuid';

import { TodoNote } from '../types';

export const dumbTodoNotes: TodoNote[] = [
  {
    id: uuidv4(),
    title: 'Buy',
    paperColor: 'yellow',
    pinColor: 'blue',
    items: [
      {
        id: uuidv4(),
        text: 'bread',
        isDone: false,
      },
      {
        id: uuidv4(),
        text: 'milk',
        isDone: false,
      },
      {
        id: uuidv4(),
        text: 'vegetables',
        isDone: false,
        children: [
          {
            id: uuidv4(),
            text: 'tomatoes',
            isDone: false,
          },
          {
            id: uuidv4(),
            text: 'cucumbers',
            isDone: false,
          },
        ],
      },
      {
        id: uuidv4(),
        text: 'tea',
        isDone: false,
      },
    ],
  },
];
