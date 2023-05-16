import { format } from 'date-fns';

import type { DateFieldTypes } from '@datalking/pivot-core';
import { Text } from '@datalking/pivot-ui';

interface IProps {
  field: DateFieldTypes;
  value: Date | undefined;
}

export const DateValue: React.FC<IProps> = ({ field, value }) => {
  if (!value) return null;

  return (
    <Text
      sx={{
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {format(value, field.formatString)}
    </Text>
  );
};
