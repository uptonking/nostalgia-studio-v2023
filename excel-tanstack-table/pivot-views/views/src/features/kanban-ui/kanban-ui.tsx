import React from 'react';

import { type IKanbanField } from '@datalking/pivot-core';
import { Box, Overlay } from '@datalking/pivot-ui';

import { useCurrentTable } from '../../hooks/use-current-table';
import { useCurrentView } from '../../hooks/use-current-view';
import { KanbanBoard } from './kanban-board';
import { SelectKanbanField } from './select-kanban-field';

// import loadable from '@loadable/component';
// const KanbanBoard = loadable(() => import('./kanban-board'));

export const KanbanUI = () => {
  const table = useCurrentTable();
  const view = useCurrentView();
  const fieldId = view.kanbanFieldId;

  if (fieldId.isNone()) {
    return (
      <Box h='100%' sx={{ position: 'relative' }}>
        <Overlay center>
          <Box w={500}>
            <SelectKanbanField />
          </Box>
        </Overlay>
      </Box>
    );
  }

  const field = table.schema.getFieldById(fieldId.unwrap().value).unwrap();

  return <KanbanBoard field={field as IKanbanField} />;
};
