import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Editor, Range } from 'slate';
import { useSlateStatic } from 'slate-react';

import { Check as CheckIcon } from '@icon-park/react';
import { css } from '@linaria/core';

import { IconButton } from '../../../src/components';
import { useClickOutside } from '../../../src/hooks';
import { insertLink } from '../../../src/plugins/link/commands';
import { themed } from '../../../src/styles/theme-vars';

export const Portal = ({ children }) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null;
};

/**
 * todo migrate to floating-ui
 */
export const AddLinkPanel = (props) => {
  const { showAddLink, setShowAddLink } = props;
  const editor = useSlateStatic();

  const containerRef = useRef<HTMLDivElement | null>();

  const [linkInput, setLinkInput] = useState('');

  const insertLinkAndClosePanel = useCallback(() => {
    insertLink(editor, linkInput);
    setShowAddLink(false);
  }, [editor, linkInput, setShowAddLink]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const { selection } = editor;

    if (
      !selection ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      // 弹框默认样式由class设置，位置由style设置，若去掉style属性会恢复默认位置，变为不可见
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.top = rect.top + window.scrollY + rect.height + 'px';
    el.style.left =
      rect.left + window.scrollX - el.offsetWidth / 2 + rect.width / 2 + 'px';
  }, [editor]);

  useClickOutside(containerRef, () => {
    if (showAddLink) {
      setShowAddLink(false);
    }
  });

  return (
    <Portal>
      <div ref={containerRef} className={addLinkContainerCss}>
        <div>
          <input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.keyCode === 13) {
                insertLinkAndClosePanel();
              }
            }}
            // defaultValue="add link to text"
            className={linkInputCss}
            type='text'
          />
          <IconButton onClick={insertLinkAndClosePanel} title='Add Link'>
            <CheckIcon />
          </IconButton>
        </div>
      </div>
    </Portal>
  );
};

const addLinkContainerCss = css`
  position: absolute;
  top: -8000px;
  left: -8000px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 480px;
  height: 64px;
  border-radius: 8px;
  box-shadow: ${themed.shadow.sm};
  background-color: ${themed.palette.white};
  opacity: 0;
  transition: opacity 0.5s;
`;

const linkInputCss = css`
  min-width: 360px;
  line-height: 1.8;
  margin-right: 24px;
  color: ${themed.color.text.muted};
  border: 1px solid ${themed.color.border.muted};
  &:focus-visible {
    outline-color: ${themed.color.border.light};
  }
`;
