import React, { useCallback, useMemo, useRef, useState } from 'react';

import { type Editor, type Selection, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import type { Icon } from '@icon-park/react/lib/runtime';
import { css } from '@linaria/core';

import { Menu, MenuItem } from '../../../../../src/components';

export const InsertImageApproaches = (props_) => {
  const imageMenu = props_.actions;

  return (
    <div>
      <Menu label='Image'>
        {imageMenu.map(({ text, callback }, index) => {
          return (
            <MenuItem
              label={text}
              onClick={() => console.log(text)}
              key={index}
            />
          );
        })}
      </Menu>
    </div>
  );
};
