import '@pgd/ui-tokens/pgd-t-tailwind.css';

import React, { useState } from 'react';

import { css } from '@linaria/core';

import { globalNormalizeCss } from '../../styles';
import { AppShellStoreContext, useAppShellStore } from './api-hooks';
import { Header } from './header';
import { MainContent } from './main-content';
import { Sidebar } from './sidebar';

type AppShellProps = {
  defaultIsSidebarOpen?: boolean;
};

export const AppShell = (props: AppShellProps) => {
  const { defaultIsSidebarOpen } = props;

  const appShellStore = useAppShellStore({ defaultIsSidebarOpen });

  return (
    <AppShellStoreContext.Provider value={appShellStore}>
      <div className={globalNormalizeCss + ' ' + rootCss}>
        <Header />
        <div className={mainContainerCss}>
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppShellStoreContext.Provider>
  );
};

const rootCss = css`
  height: 100%;
`;

const mainContainerCss = css`
  /* overflow: auto;
  display: flex;
  flex-direction: column; */
  /* width: 100%; */
`;
