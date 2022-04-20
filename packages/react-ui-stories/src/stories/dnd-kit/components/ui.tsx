import React from 'react';
import cx from 'classnames';

import styles from './ui.module.scss';

export function OverflowWrapper({ children }: { children: React.ReactNode }) {
  return <div className={styles.OverflowWrapper}>{children}</div>;
}

interface WrapperProps {
  children: React.ReactNode;
  center?: boolean;
  style?: React.CSSProperties;
}

export function Wrapper({ children, center, style }: WrapperProps) {
  return (
    <div className={cx(styles.Wrapper, center && styles.center)} style={style}>
      {children}
    </div>
  );
}
