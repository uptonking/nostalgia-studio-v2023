import React from 'react';

import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { useAppShellContext } from './api-hooks';

type HeaderProps = {
  /** component shown at the left of header. fully customizable */
  logoPart?: React.ReactNode;
  /** component shown at the logo text/icon. not so customizable as `logoPart` */
  logoContent?: React.ReactNode;
  /** component shown at the right of header. fully customizable */
  infoPart?: React.ReactNode;
};

const defaultInfoPart = 'user/darkMode';

export const Header = (props: HeaderProps) => {
  const { logoPart, logoContent, infoPart } = props;
  const appShellStore = useAppShellContext();

  return (
    <header className={rootCss}>
      <div className={logoPartCss}>
        {logoPart || null}
        {logoContent ? <div className={logoCss}>{logoContent}</div> : null}
        {!logoPart && !logoContent ? (
          <>
            <div className={logoCss}>logo</div>
            <button onClick={() => appShellStore.toggleSidebar()}>
              toggle
            </button>
          </>
        ) : null}
      </div>
      <div className={infoPartCss}>{infoPart || defaultInfoPart}</div>
    </header>
  );
};

const rootCss = css`
  /* position: sticky; */
  position: fixed;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: ${themed.spacing.rem.n16};
  border-bottom: ${themed.border.presets.default};
  background-color: ${themed.palette.white};
  z-index: ${themed.zIndex.n30};
`;

const logoPartCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: ${themed.spacing.rem.n64};
  padding-left: ${themed.spacing.rem.n6};
`;

const logoCss = css`
  color: ${themed.color.brand.primary};
  font-size: ${themed.font.size.xl3};
  font-weight: 600;
  line-height: ${themed.size.lineHeight.rem.n9};
`;

const infoPartCss = css`
  display: flex;
  align-items: center;
  padding-right: ${themed.spacing.rem.n6};
`;
