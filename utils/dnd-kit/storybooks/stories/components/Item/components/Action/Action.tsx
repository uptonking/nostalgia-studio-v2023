import cx from 'classnames';
import React, {CSSProperties} from 'react';

import styles from './Action.module.css';

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties['cursor'];
}

/** 可定制样式的button */
export function Action({active, className, cursor, style, ...props}: Props) {
  return (
    <button
      {...props}
      className={cx(styles.Action, className)}
      tabIndex={0}
      style={
        {
          ...style,
          cursor,
          '--fill': active?.fill,
          '--background': active?.background,
        } as CSSProperties
      }
    />
  );
}
