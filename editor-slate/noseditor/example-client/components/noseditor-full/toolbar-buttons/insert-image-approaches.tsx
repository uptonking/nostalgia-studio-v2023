import React, { useCallback, useMemo, useRef, useState } from 'react';

import { type Editor, type Selection, Transforms } from 'slate';
import { useSlateStatic } from 'slate-react';

import type { Icon } from '@icon-park/react/lib/runtime';
import { css } from '@linaria/core';

import { Menu, MenuItem } from '../../../../src/components';
import { insertImage } from '../../../../src/plugins/image/commands';

export const InsertImageApproaches = (props_) => {
  const {
    actions: imageMenuData,
    icon: ImageIcon,
    setShowFloatingPanel,
    setPanelType,
  } = props_;
  const editor = useSlateStatic();

  const imageUploadInputRef = useRef<HTMLInputElement>();

  return (
    <div>
      <Menu label={(<ImageIcon />) as any} hideBorder={true}>
        {imageMenuData.map(({ type, text, icon: Icon, callback }, index) => {
          if (type === 'uploadImage') {
            return (
              <MenuItem
                label={
                  <>
                    <Icon />
                    <span>{text}</span>
                  </>
                }
                onClick={() => {
                  imageUploadInputRef.current.click();
                }}
                key={index}
              />
            );
          }

          if (type === 'insertImageUrl') {
            return (
              <MenuItem
                label={
                  <>
                    <Icon />
                    <span>{text}</span>
                  </>
                }
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setPanelType('image');
                  setShowFloatingPanel(true);
                }}
                key={index}
              />
            );
          }

          return (
            <MenuItem
              label={
                <>
                  <Icon />
                  <span>{text}</span>
                </>
              }
              onClick={() => console.log(text)}
              key={index}
            />
          );
        })}
      </Menu>
      <input
        type='file'
        onChange={(event) => {
          const imageFile = event.target.files[0];
          const reader = new FileReader();
          reader.onload = () => {
            insertImage(editor, reader.result as string);
          };
          reader.readAsDataURL(imageFile);
        }}
        ref={imageUploadInputRef}
        accept='image/*'
        multiple={false}
        name='imageUploadInput'
        style={{ display: 'none' }}
      />
    </div>
  );
};
