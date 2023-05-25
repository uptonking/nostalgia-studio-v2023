import React from 'react';

import { css } from '@linaria/core';
import { Loader } from '@mantine/core';

export { Loader };

export const FullPageLoader = () => {
  return (
    <div className={fullPageCss}>
      <Loader />
    </div>
  );
};

const fullPageCss = css`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 98vw;
  height: 98vh;
  /* width: 100%; */
  /* height: 100%; */
`;
