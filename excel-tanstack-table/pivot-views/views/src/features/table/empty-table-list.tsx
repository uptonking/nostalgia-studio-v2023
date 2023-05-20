import React from 'react';

import { useSetAtom } from 'jotai';
import { Trans, useTranslation } from 'react-i18next';

import {
  Button,
  Center,
  Code,
  IconPlus,
  Stack,
  Text,
} from '@datalking/pivot-ui';

import {
  createTableFormDrawerOpened,
} from '../create-table-form/drawer-opened.atom';

export const EmptyTableList = () => {
  const { t } = useTranslation();
  const setOpened = useSetAtom(createTableFormDrawerOpened);

  return (
    <Center w='100%' h='100%' bg='gray.1'>
      <Stack>
        <Center>
          <Text size='lg' fw={600}>
            {t('Create New Table')}
          </Text>
        </Center>
        <Center>
          <Text size='sm' color='gray'>
            <Trans
              i18nKey="shortcut T"
              t={t}
              values={{ shortcut: 'T' }}
              // components={[<Code fz='md' children={null} />]}
              components={[<Code fz='md' key={0}>{null}</Code>]}
            />
          </Text>
        </Center>
        <Button
          miw={150}
          onClick={() => setOpened(true)}
          leftIcon={<IconPlus size={16} />}
        >
          {t('Create New Table')}
        </Button>
      </Stack>
    </Center>
  );
};
