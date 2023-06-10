import cx from 'classnames';
import React, {type HTMLAttributes} from 'react';

import styles from './Button.module.css';

export interface Props extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({children, ...props}: Props) {
  return (
    <button className={cx(styles.Button)} {...props}>
      {children}
    </button>
  );
}
