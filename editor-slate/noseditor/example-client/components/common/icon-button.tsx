import React, { useEffect, useState } from 'react';

import cx from 'classnames';

import type { IIconProps } from '@icon-park/react/lib/runtime';

type IconButtonProps = {
  className?: string;
  children: React.ReactElement<IIconProps>;
  title?: string;
} & Omit<React.HTMLProps<HTMLButtonElement>, 'type'>;

export const IconButton = (props_: IconButtonProps) => {
  const { className, children, title = 'icon', ...props } = props_;
  return (
    <button type='button' className={cx('nos-icon-btn', className)} {...props}>
      {children}
    </button>
  );
};
