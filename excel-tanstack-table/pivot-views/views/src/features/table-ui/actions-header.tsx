import React from 'react';

import { useTranslation } from 'react-i18next';

import {
  ActionIcon,
  Center,
  IconColumnInsertRight,
  openContextModal,
  Tooltip,
} from '@datalking/pivot-ui';
import { type Table } from '@tanstack/react-table';

import { ACTIONS_FIELD } from '../../constants/field.constants';
import { CREATE_FIELD_MODAL_ID } from '../../modals';
import { type TData } from './interface';

export const ActionsHeader: React.FC<{ table: Table<TData> }> = () => {
  const { t } = useTranslation();

  return (
    <th key={ACTIONS_FIELD} style={{ border: 0, width: '50px' }}>
      <Center>
        <Tooltip label={t('Create New Field')}>
          <ActionIcon
            component='a'
            onClick={() =>
              openContextModal({
                title: t('Create New Field'),
                modal: CREATE_FIELD_MODAL_ID,
                innerProps: {},
              })
            }
          >
            <IconColumnInsertRight />
          </ActionIcon>
        </Tooltip>
      </Center>
    </th>
  );
};
