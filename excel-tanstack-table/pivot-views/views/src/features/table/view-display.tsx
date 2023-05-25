import React from 'react';

import { useSwitchDisplayTypeMutation } from '@datalking/pivot-store';
import { LoadingOverlay, useDebouncedValue } from '@datalking/pivot-ui';

import { useCurrentView } from '../../hooks/use-current-view';
import { useFixedCacheKey } from '../../hooks/use-fixed-cache-key';
import { CalendarUI } from '../calendar-ui/calendar-ui';
import { KanbanUI } from '../kanban-ui/kanban-ui';
import { TableUI } from '../table-ui/table-ui';
import { TreeViewUI } from '../tree-view-ui/tree-view-ui';

/**
 * container for multiple types of views
 */
export const ViewDisplay = () => {
  const view = useCurrentView();
  const displayType = view.displayType;

  const cacheKey = useFixedCacheKey();

  const [, { isLoading }] = useSwitchDisplayTypeMutation({
    fixedCacheKey: cacheKey,
  });
  const [debouncedLoading] = useDebouncedValue(isLoading, 200);

  if (displayType === 'kanban') {
    return (
      <>
        <LoadingOverlay visible={debouncedLoading} />
        <KanbanUI />
      </>
    );
  }

  if (displayType === 'calendar') {
    return (
      <>
        <LoadingOverlay visible={debouncedLoading} />
        <CalendarUI />{' '}
      </>
    );
  }

  if (displayType === 'tree') {
    return (
      <>
        <LoadingOverlay visible={debouncedLoading} />
        <TreeViewUI />
      </>
    );
  }

  return (
    <>
      <LoadingOverlay visible={debouncedLoading} />
      <TableUI />
    </>
  );
};
