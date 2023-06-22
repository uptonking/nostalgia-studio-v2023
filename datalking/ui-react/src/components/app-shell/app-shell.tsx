import React from 'react';

import { css } from '@linaria/core';

import { globalNormalizeCss } from '../../styles';
import { Header } from './header';
import { MainContent } from './main-content';
import { Sidebar } from './sidebar';

export const AppShell = () => {
  return (
    <div className={globalNormalizeCss + ' ' + rootCss}>
      <Sidebar />
      <div className={mainContainerCss}>
        <Header />
        <MainContent />
      </div>
    </div>
  );
};

const rootCss = css`
  display: flex;
  height: 100%;
`;

const mainContainerCss = css`
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
`;
