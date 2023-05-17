import React from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldId } from '@datalking/pivot-core';
import type { ICreateTableInput } from '@datalking/pivot-cqrs';
import { Button, IconPlus } from '@datalking/pivot-ui';

export const CreateTableAddFieldButton: React.FC = () => {
  const form = useFormContext<ICreateTableInput>();
  // @ts-ignore
  const { append } = useFieldArray<ICreateTableInput>({
    name: 'schema',
  });
  const len = form.watch('schema').length;
  const hasSchema = len > 0;

  const { t } = useTranslation();

  return (
    <Button
      onClick={() => {
        append({ id: FieldId.createId(), type: 'string', name: '' });
      }}
      fullWidth
      color={hasSchema ? 'gray' : 'orange'}
      variant={hasSchema ? 'white' : 'light'}
      leftIcon={<IconPlus size={16} />}
    >
      {t('Create New Field')}
    </Button>
  );
};
