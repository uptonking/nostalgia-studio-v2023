export type TodoItem = {
  id: string;
  text: string;
  isDone: boolean;
  children?: TodoItem[];
};
