import React, { useEffect, useState } from 'react';

import type { IIconProps } from '@icon-park/react/lib/runtime';
import { styled } from '@linaria/react';

type IconButtonProps = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactElement<IIconProps>;
  as?: React.ElementType;
  /** default tooltip */
  title?: string;
} & Omit<React.HTMLProps<HTMLButtonElement>, 'type'>;

export const IconButton = (props_: IconButtonProps) => {
  const { children, ...props } = props_;
  return (
    <StyledButton type='button' {...props}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button<IconButtonProps>`
  width: 28px;
  height: 28px;
  padding-top: 4px;
  padding-bottom: 4px;
  border: 0;
  border-radius: 6px;
  background-color: transparent;
  color: #4c566a;
  cursor: pointer;
  &:hover {
    background-color: #f3f4f5;
  }
`;
