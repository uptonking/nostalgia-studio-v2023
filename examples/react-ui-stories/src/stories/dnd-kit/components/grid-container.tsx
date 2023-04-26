import React from 'react';

import styles from './grid-container.module.scss';

export interface GridContainerProps {
  children: React.ReactNode;
  columns: number;
}

/**
 * `ul` with `display: grid;`
 */
export function GridContainer({ children, columns }: GridContainerProps) {
  return (
    <ul
      className={styles.GridContainer}
      style={
        {
          '--col-count': columns,
        } as React.CSSProperties
      }
    >
      {children}
    </ul>
  );
}
