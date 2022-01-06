import { TaskListContent, TaskListDefinition } from '../../../adf-schema';

export const taskList =
  (attrs: TaskListDefinition['attrs']) =>
  (...content: TaskListContent): TaskListDefinition => ({
    type: 'taskList',
    attrs,
    content,
  });
