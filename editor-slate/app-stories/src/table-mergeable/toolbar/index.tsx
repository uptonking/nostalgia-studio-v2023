import './index.css';

import React, { HTMLAttributes } from 'react';

import cx from 'classnames';

interface CardbarProps extends HTMLAttributes<HTMLDivElement> {
  delete?: () => void;
}

const exec =
  (func: Function, ...args: any[]) =>
  (e?: React.MouseEvent) => {
    e && e.preventDefault();
    return func(...args);
  };

export const Cardbar: React.FC<CardbarProps> = (props) => {
  return (
    <div className={cx('cardbar', props.className)}>
      <div style={{ display: 'flex', gap: 4 }}>
        {props.children}
        {props.delete && (
          <button
            // icon={<DeleteOutlined />}
            onMouseDown={exec(props.delete)}
          />
        )}
      </div>
    </div>
  );
};
