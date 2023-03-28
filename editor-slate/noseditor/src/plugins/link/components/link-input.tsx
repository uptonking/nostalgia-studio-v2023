import React, { forwardRef, useState } from 'react';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import {
  CopyIcon,
  EditIcon,
  IconButton,
  LinkInterruptIcon as UnlinkIcon,
} from '../../../components';
import { themed } from '../../../styles/theme-vars';

type LinkInputProps = {
  text?: string;
  link?: string;
} & React.HTMLProps<HTMLDivElement>;

export const LinkInput = forwardRef<HTMLDivElement, LinkInputProps>(
  (props_, ref) => {
    const { className, link, ...props } = props_;
    const [isEditing, SetIsEditing] = useState(false);
    ' level, extremely configurable and flexible: At the cost of more code to setup, you get high control and flexibility, so you can create “bespoke” and complex floating elements you won’t find in most component libraries.';

    return (
      <div ref={ref} className={linkContainerCss + ' ' + className} {...props}>
        <div className={mainCss}>
          {isEditing ? <input type='text' defaultValue={link} /> : <div className={linkUrlCss}>{link}</div>}
          <div className=''>
            <StyledIconButton onClick={() => SetIsEditing(v => !v)}>
              <EditIcon title='edit link' />
            </StyledIconButton>
            <StyledIconButton>
              {isEditing ? (
                <UnlinkIcon title='remove link' />
              ) : (
                <CopyIcon title='copy link' />
              )}
            </StyledIconButton>
          </div>
        </div>
      </div>
    );
  },
);

const StyledIconButton = styled(IconButton)`
  margin-left: 6px;
  &:hover {
    background-color: ${themed.color.background};
  }
`;

const linkContainerCss = css`
  display: flex;
  align-items: center;
  min-width: 320px;
  max-width: 720px;
  min-height: 48px;
  background-color: ${themed.palette.white};

  /* backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%); */
  /* background-color: rgba(255, 255, 255, 0.75); */
  border-radius: 8px;
  border: 1px solid rgba(209, 213, 219, 0.3);
`;

const mainCss = css`
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 16px;
  margin-right: 16px;
`;

const linkUrlCss = css`
  max-width: 500px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: ${themed.color.text.body};
`;
