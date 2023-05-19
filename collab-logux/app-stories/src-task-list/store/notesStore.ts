import { action } from 'nanostores';

import { persistentAtom } from '@nanostores/persistent';

import { dumbTodoNotes } from '../constants/todoListConstant';
import type { TodoNote } from '../types';

const notes = persistentAtom<TodoNote[]>('notes', dumbTodoNotes, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

const addNote = action(notes, 'add', (store, newNote) => {
  store.set([...store.get(), newNote]);
  return store.get();
});

const updateNote = action(notes, 'update', (store, updatedNote) => {
  const list = [...store.get()];
  store.set(
    list.map((note) => {
      if (note.id === updatedNote.id) {
        return updatedNote;
      }
      return note;
    }),
  );
  return store.get();
});

const removeNote = action(notes, 'remove', (store, id) => {
  store.set(store.get().filter((note) => note.id !== id));
  return store.get();
});

const toggleTodoItem = action(notes, 'check', (store, noteId, itemId) => {
  store.set(
    store.get().map((note) => {
      if (note.id === noteId) {
        note.items = note.items?.map((item) => {
          if (item.id === itemId) {
            item.isDone = !item.isDone;
            if (item.children) {
              item.children = item.children.map((childItem) => {
                childItem.isDone = item.isDone;
                return childItem;
              });
            }
          } else if (item.children) {
            let isDone = false;
            item.children = item.children.map((childItem) => {
              if (childItem.id === itemId) {
                childItem.isDone = !childItem.isDone;
                isDone = childItem.isDone;
              }
              return childItem;
            });
            if (!isDone) {
              item.isDone = false;
            }
            if (item.children.every((childItem) => childItem.isDone)) {
              item.isDone = true;
            }
          }
          return item;
        });
      }
      return note;
    }),
  );
  return store.get();
});

export { notes, addNote, updateNote, removeNote, toggleTodoItem };
