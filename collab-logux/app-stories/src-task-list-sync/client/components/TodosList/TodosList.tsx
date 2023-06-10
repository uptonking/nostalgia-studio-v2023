import React, { useState } from 'react';

import cx from 'classnames';
import { nanoid } from 'nanoid';

import { createSyncMap } from '@logux/client';
import { useClient, useFilter } from '@logux/client/react';
import { useStore } from '@nanostores/react';

import { authStore } from '../../stores/auth';
import { Filter, filterStore } from '../../stores/filter';
import { tasksStore } from '../../stores/tasks';
import { ControlPanel } from '../ControlPanel/ControlPanel';
import { TextField } from '../TextField/TextField';
import { ToggleAction } from '../ToggleAction/ToggleAction';
import styles from './TodosList.module.css';
import { TodosListItem } from './TodosListItem';

export const TodosList = () => {
  const client = useClient();
  const filter = useStore(filterStore);
  const { id: authorId } = useStore(authStore);

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const tasks = useFilter(tasksStore, {
    authorId,
    ...(filter === Filter.all
      ? {}
      : { completed: filter === Filter.completed }),
  });

  return (
    <div className={styles.todosList}>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          createSyncMap(client, tasksStore, {
            id: nanoid(),
            text: newTaskTitle,
            completed: false,
            authorId,
          });

          setNewTaskTitle('');
        }}
      >
        <TextField
          id='create-new-task'
          label='Create new task'
          placeholder='What needs to be done?'
          theme='flat'
          value={newTaskTitle}
          onChange={(event) => {
            setNewTaskTitle(event.target.value);
          }}
          hiddenLabel
        />
        <button type='submit' className={styles.createAction}>
          Create
        </button>
      </form>

      <div className={styles.toggleAction}>
        <ToggleAction />
      </div>

      {tasks.isLoading ? (
        <div className={cx(styles.note, styles.noteTypeSkeleton)}>
          <span className={styles.label} />
        </div>
      ) : (
        <ul className={styles.list}>
          {tasks.list.map((todo) => (
            <TodosListItem
              key={todo.id}
              id={todo.id}
              completed={todo.completed}
              text={todo.text}
            />
          ))}
        </ul>
      )}

      <ControlPanel />
    </div>
  );
};
