import React, { forwardRef, useCallback, useState } from 'react';

import { useSlateStatic } from 'slate-react';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import {
  CheckIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  IconButton,
} from '../../../components';
import { themed } from '../../../styles/theme-vars';
import { removeLink, updateLink } from '../commands';
import type { LinkElementType } from '../types';

type LinkInputProps = {
  linkElement: LinkElementType;
  /** the link url; also support plain text */
  linkHref?: string;
} & React.HTMLProps<HTMLDivElement>;

export const LinkInput = forwardRef<HTMLDivElement, LinkInputProps>(
  (props_, ref) => {
    const { className, linkHref, linkElement, ...props } = props_;
    const editor = useSlateStatic();

    const [isEditing, setIsEditing] = useState(false);
    const [linkInput, setLinkInput] = useState(linkHref);
    const [linkTextWidth, setLinkTextWidth] = useState(0);

    const updateLinkDataAndStopEditing = useCallback(() => {
      if (isEditing && linkHref !== linkInput) {
        updateLink(editor, linkElement, linkInput);
      }
      setIsEditing((v) => !v);
    }, [editor, isEditing, linkElement, linkHref, linkInput]);

    return (
      <div ref={ref} className={linkContainerCss + ' ' + className} {...props}>
        <div className={mainCss}>
          {isEditing ? (
            <input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                  updateLinkDataAndStopEditing();
                }
              }}
              className={linkInputCss}
              name='linkUrlInput'
              type='text'
              style={{ width: linkTextWidth }}
            />
          ) : (
            <div
              ref={(node) => {
                if (node) {
                  const minWidth = 210; // avoid ui jump when width change
                  setLinkTextWidth(
                    node.clientWidth > minWidth ? node.clientWidth : minWidth,
                  );
                }
              }}
              className={linkUrlCss}
              key={linkTextWidth}
            >
              {linkHref}
            </div>
          )}
          <div className=''>
            <StyledIconButton
              title={isEditing ? 'Remove Link' : 'Copy Link'}
              onClick={() => {
                if (isEditing) {
                  removeLink(editor, linkElement);
                } else {
                  // copy link url
                  (async () => {
                    await navigator.clipboard.writeText(linkElement.url);
                  })();
                }
              }}
            >
              {isEditing ? <DeleteIcon /> : <CopyIcon />}
            </StyledIconButton>
            <StyledIconButton
              title={isEditing ? 'Save' : 'Edit Link'}
              onClick={updateLinkDataAndStopEditing}
            >
              {isEditing ? <CheckIcon /> : <EditIcon />}
            </StyledIconButton>
          </div>
        </div>
      </div>
    );
  },
);

const StyledIconButton = styled(IconButton)`
  margin-left: 6px;
`;

const linkContainerCss = css`
  display: flex;
  align-items: center;
  min-width: 300px;
  max-width: 720px;
  min-height: 48px;
  background-color: ${themed.palette.white};
  border-radius: 8px;
  /* border: 1px solid rgba(209, 213, 219, 0.3); */
  box-shadow: ${themed.shadow.sm};
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
  line-height: 1.8;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: ${themed.color.text.muted};
`;

const linkInputCss = css`
  min-width: 360px;
  line-height: 1.8;
  color: ${themed.color.text.muted};
  border: 1px solid ${themed.color.border.muted};
  &:focus-visible {
    outline-color: ${themed.color.border.light};
  }
`;
