import type { ICalendarField } from '@datalking/pivot-core';
import { Box, Overlay } from '@datalking/pivot-ui';
import loadable from '@loadable/component';

import { useCurrentTable } from '../../hooks/use-current-table';
import { useCurrentView } from '../../hooks/use-current-view';
import { SelectCalendarField } from './select-calendar-field';

const CalendarBoard = loadable(() => import('./calendar-board'));

export const CalendarUI: React.FC = () => {
  const table = useCurrentTable();
  const view = useCurrentView();
  const calendarFieldId = view.calendarFieldId.into();
  if (calendarFieldId) {
    const field = table.schema
      .getFieldById(calendarFieldId.value)
      .into() as ICalendarField;
    return <CalendarBoard field={field} />;
  }

  return (
    <Box h='100%' sx={{ position: 'relative' }}>
      <Overlay center>
        <Box w={500}>
          <SelectCalendarField />
        </Box>
      </Overlay>
    </Box>
  );
};
