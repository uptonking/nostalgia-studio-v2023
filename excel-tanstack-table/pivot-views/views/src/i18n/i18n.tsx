import 'dayjs/locale/zh-cn';

import React from 'react';

import { DatesProvider } from '@datalking/pivot-ui';

import i18n from './client';

export const I18n: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DatesProvider settings={{ locale: i18n.language }}>
      {children}
    </DatesProvider>
  );
};
