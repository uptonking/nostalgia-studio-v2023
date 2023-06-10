import { type TodoItem } from './todoItem';

export type TodoNote = {
  id: string;
  title: string;
  items?: TodoItem[];
  paperColor: string;
  pinColor: string;
};
