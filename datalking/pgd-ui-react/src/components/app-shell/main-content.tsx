import React from 'react';

import { css } from '@linaria/core';

import { cardBoxCss } from '../../styles';
import { Switch } from '../switch';

export const MainContent = () => {
  return (
    <div className={rootCss}>
      <div className={contentCss}>
        <div className={cardBoxCss}>
          <h3>content</h3>
          <Switch />
        </div>
      </div>
      <div className={infoPanelCss}>
        <div className={cardBoxCss}>description</div>
      </div>
    </div>
  );
};

const rootCss = css`
  display: flex;
  gap: 24px;
  padding: 32px;
  background-color: #f3f5f7;
`;

const contentCss = css`
  /* display: flex; */
  width: 70%;
`;

const infoPanelCss = css`
  /* display: flex; */
  width: 30%;
`;
