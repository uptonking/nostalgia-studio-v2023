import React from 'react';

import { useTranslation } from 'react-i18next';

import { getCurrentTableRecordsTotal } from '@datalking/pivot-store';
import { Text } from '@datalking/pivot-ui';

import { useAppSelector } from '../../hooks';

export const RecordsTotal: React.FC = () => {
  const total = useAppSelector(getCurrentTableRecordsTotal);
  const { t } = useTranslation();

  return (
    <Text size='xs' color='gray'>
      {t('Total Records', { total })}
    </Text>
  );
};
