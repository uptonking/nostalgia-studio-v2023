import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Editor, Range } from 'slate';
import { useSlateStatic } from 'slate-react';

import { Check as CheckIcon } from '@icon-park/react';
import { css } from '@linaria/core';

import { IconButton } from '../../../../src/components';
import { useClickOutside } from '../../../../src/hooks';
import { insertImage } from '../../../../src/plugins/image/commands';
import { insertLink } from '../../../../src/plugins/link/commands';
import { themed } from '../../../../src/styles/theme-vars';

export const Portal = ({ children }) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null;
};

type PanelActionsType = {
  inputPlaceholder: string;
  insertCommand: (editor: Editor, url: string) => void;
  confirmIconTooltipText: string;
};

export const getPanelActions = ({
  type,
}: {
  type: 'link' | 'image';
}): PanelActionsType | null => {
  if (type === 'link') {
    return {
      inputPlaceholder: 'Add link URL to selected text',
      insertCommand: insertLink,
      confirmIconTooltipText: 'Add Link',
    };
  }

  if (type === 'image') {
    return {
      inputPlaceholder: 'Add Image URL',
      insertCommand: insertImage,
      confirmIconTooltipText: 'Add Image',
    };
  }

  return null;
};

type FloatingActionPanelProps = {
  type: 'link' | 'image';
  showFloatingPanel?: boolean;
  setShowFloatingPanel?: React.Dispatch<React.SetStateAction<boolean>>;
  initialShowPanel?: boolean;
};

/** floating panel for adding link/image
 *
 * todo migrate to floating-ui, like context-menu example
 */
export const FloatingActionPanel = (props: FloatingActionPanelProps) => {
  const {
    type = 'image',
    showFloatingPanel,
    setShowFloatingPanel,
    initialShowPanel = false,
  } = props;
  const [uncontrolledShow, setUncontrolledShow] = useState(initialShowPanel);
  const showPanel = showFloatingPanel ?? uncontrolledShow;
  const setShowPanel = setShowFloatingPanel ?? setUncontrolledShow;

  const editor = useSlateStatic();

  const rootContainerRef = useRef<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement | null>();
  const [input, setInput] = useState('');

  const actions = useMemo(() => getPanelActions({ type }), [type]);

  const insertInputAndClosePanel = useCallback(() => {
    // insertLink(editor, input);
    actions.insertCommand(editor, input);
    setInput('');
    setShowPanel(false);
  }, [actions, editor, input, setShowPanel]);

  useEffect(() => {
    const rootElem = rootContainerRef.current;
    const inputElem = inputRef.current;
    if (!rootElem || !inputElem) return;

    const { selection } = editor;

    // console.log(';; panel ', showPanel, selection);

    if (
      !selection ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      // 弹框默认样式由class设置，位置由style设置，若去掉style属性会恢复默认位置，变为不可见
      rootElem.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    rootElem.style.opacity = '1';
    rootElem.style.top = rect.top + window.scrollY + rect.height + 'px';
    rootElem.style.left =
      rect.left +
      window.scrollX -
      rootElem.offsetWidth / 2 +
      rect.width / 2 +
      'px';

    inputElem.focus();
  }, [editor, showPanel]);

  useClickOutside(rootContainerRef, () => {
    if (showPanel) {
      setInput('');
      setShowPanel(false);
    }
  });

  return (
    <Portal>
      <div ref={rootContainerRef} className={rootContainerCss}>
        <div>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.keyCode === 13) {
                insertInputAndClosePanel();
              }
            }}
            className={inputCss}
            type='text'
            placeholder={actions.inputPlaceholder}
          />
          <IconButton
            onClick={insertInputAndClosePanel}
            title={actions.confirmIconTooltipText}
          >
            <CheckIcon />
          </IconButton>
        </div>
      </div>
    </Portal>
  );
};

const rootContainerCss = css`
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

const inputCss = css`
  min-width: 360px;
  line-height: 1.8;
  margin-right: 24px;
  color: ${themed.color.text.muted};
  border: 1px solid ${themed.color.border.muted};
  &:focus-visible {
    outline-color: ${themed.color.border.light};
  }
`;
