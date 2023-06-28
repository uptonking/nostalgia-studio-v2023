import '@pgd/ui-tokens/pgd-t-tailwind.css';

import React, { useLayoutEffect } from 'react';

import cx from 'clsx';

import { useStoreState } from '@ariakit/react-core/utils/store';
import { css } from '@linaria/core';
import { globalNormalizeCss, heightFull, themed } from '@pgd/ui-tokens';

import { DocPage } from '../doc-page';
import { docTestData } from '../doc-page/doc-page';
import { AppShellStoreContext, useAppShellStore } from './api-hooks';
import { Header } from './header';
import { MainContent } from './main-content';
import { Sidebar } from './sidebar';

type AppShellProps = {
  /** container element is required for AppShell to fill its height. */
  container: HTMLElement;
  defaultIsSidebarOpen?: boolean;
  mainContent?: React.ReactNode;
};

/**
 * Classic webapp layout with a header, a sidebar, a content-area
 * - for AppShell to work, its container DOM Element should have `height: 100%`.
 *   - if full-height still not works, you should check the container's parent height.
 */
export const AppShell = (props: AppShellProps) => {
  const {
    defaultIsSidebarOpen,
    container,
    mainContent = <DocPage {...docTestData} />,
  } = props;

  const appShellStore = useAppShellStore({ defaultIsSidebarOpen });
  const isSidebarOpen = useStoreState(appShellStore, (state) => {
    return state.isSidebarOpen;
  });

  useLayoutEffect(() => {
    if (!container) {
      throw new Error('container prop for AppShell Component is required');
    }

    if (!container.classList.contains(heightFull)) {
      container.classList.add(heightFull);
    }
  }, [container]);

  return (
    <AppShellStoreContext.Provider value={appShellStore}>
      <div className={cx(globalNormalizeCss, rootCss)}>
        <Header />
        <div
          className={cx(mainContainerCss, {
            [mainContainerWidth]: isSidebarOpen,
          })}
        >
          <Sidebar />
          <MainContent>{mainContent}</MainContent>
        </div>
      </div>
    </AppShellStoreContext.Provider>
  );
};

const rootCss = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-family: ${themed.font.family.sans};
`;

const mainContainerCss = css`
  flex-grow: 1;
  margin-top: ${themed.spacing.rem.n16};
  /* overflow-x: hidden; */
  /* overflow-y: auto; */
  /* display: flex; */
  /* flex-direction: column; */
  /* width: 100%; */
`;

const mainContainerWidth = css`
  width: calc(100% - ${themed.spacing.rem.n64});
`;
