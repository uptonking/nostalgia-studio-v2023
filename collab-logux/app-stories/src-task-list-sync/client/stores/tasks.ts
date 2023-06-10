import { syncMapTemplate } from '@logux/client';

import { type Task } from '../../protocol/index';

export const tasksStore = syncMapTemplate<Task>('tasks');
