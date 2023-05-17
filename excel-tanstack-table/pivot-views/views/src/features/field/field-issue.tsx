import React from 'react';

import { t } from 'i18next';

import type { Field } from '@datalking/pivot-core';
import type { ActionIconProps } from '@datalking/pivot-ui';
import {
  ActionIcon,
  IconExclamationCircle,
  Tooltip,
} from '@datalking/pivot-ui';

interface IProps extends ActionIconProps {
  field: Field;
}
export const FieldIssue: React.FC<IProps> = ({ field, ...rest }) => {
  return (
    <Tooltip
      label={field.issues.map((issue) => t(issue.unpack()))}
      withinPortal
    >
      <ActionIcon size='sm' color='red.5' variant='light' {...rest}>
        <IconExclamationCircle />
      </ActionIcon>
    </Tooltip>
  );
};
