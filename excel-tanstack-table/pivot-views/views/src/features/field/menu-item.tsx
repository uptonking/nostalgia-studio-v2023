import '@emotion/react';

import React from 'react';

import { createStyles } from '@datalking/pivot-ui';

export const useMenuStyle: ReturnType<typeof createStyles<'menu', object>> =
  createStyles((theme) => ({
    menu: {
      padding: theme.spacing.xs,
      fontSize: theme.fontSizes.xs,
      height: '35px',
    },
  }));
