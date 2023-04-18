import React, { useCallback, useMemo, useRef, useState } from 'react';

import { type Editor, type Selection, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import type { Icon } from '@icon-park/react/lib/runtime';
import { css } from '@linaria/core';

import { IconButton } from '../../../../../src/components';
import { addMarkData } from '../../../../../src/utils/commands';
import { usePopup } from '../../../../hooks/use-popup';
import { popupCss, popupWrapperCss } from '../../../../styles/common.styles';
import { colors } from './default-colors';

type ColorPickerProps = {
  format?: 'color' | 'bgColor';
  editor: Editor;
  icon: Icon;
  title?: string;
};

export const ColorPicker = ({
  format = 'color',
  editor,
  title,
  icon: Icon,
}: ColorPickerProps) => {
  const [selection, setSelection] = useState<Selection>();
  const colorPickerRef = useRef(null);
  const [showPicker, setShowPicker] = usePopup(colorPickerRef);

  // console.log(';; showPicker ', format, showPicker)

  const changeColor = useCallback(
    (e) => {
      const clickedColor = e.target.getAttribute('data-value');
      if (selection) Transforms.select(editor, selection);

      addMarkData(editor, { format, value: clickedColor });
      ReactEditor.focus(editor);
      setShowPicker(false);
    },
    [editor, format, selection, setShowPicker],
  );

  const toggleOption = useCallback(() => {
    setSelection(editor.selection);
    setShowPicker((prev) => !prev);
  }, [editor.selection, setShowPicker]);

  return (
    <div className={popupWrapperCss} ref={colorPickerRef}>
      <IconButton onMouseDown={toggleOption} title={title}>
        <Icon />
      </IconButton>
      {showPicker ? (
        <div className={popupCss}>
          <div className={colorOptionsCss}>
            {colors.map((color, index) => {
              return (
                <div
                  onClick={changeColor}
                  data-value={color}
                  className={hexPreviewCss}
                  style={{ backgroundColor: color }}
                  key={color}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const colorOptionsCss = css`
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto;
  align-items: center;
  gap: 5px;
`;

const hexPreviewCss = css`
  width: 16px;
  height: 16px;
  background-color: #000000;
  cursor: pointer;
`;
