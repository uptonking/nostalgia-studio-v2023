import React, { useCallback, useEffect, useState } from 'react';

import {
  Edit as EditIcon,
  PreviewOpen as ViewOnlyIcon,
  Refresh as ResetIcon,
} from '@icon-park/react';
import { css } from '@linaria/core';

import { IconButton } from '../../../src';
import { themed } from '../../../src/styles';

type NosNavbarProps = {
  isReadOnly: boolean;
  setIsReadOnly: React.Dispatch<React.SetStateAction<boolean>>;
  resetEditorContents: () => void;
};

export const NosNavbar = (props: NosNavbarProps) => {
  const { isReadOnly, setIsReadOnly, resetEditorContents } = props;

  const handleResetEditorContent = useCallback(() => {
    if (window.confirm('Are you sure you want to RESET ALL Contents ？')) {
      resetEditorContents();
    }
  }, [resetEditorContents]);

  return (
    <div className='nosedit-navbar'>
      <div className={logoCss}>NosEditor</div>

      <div className='flex gap-3'>
        <IconButton onClick={() => setIsReadOnly((v) => !v)}>
          {isReadOnly ? (
            <ViewOnlyIcon title='read only mode' />
          ) : (
            <EditIcon title='edit mode' />
          )}
        </IconButton>
        <IconButton onClick={handleResetEditorContent}>
          <ResetIcon title='discard all changes' />
        </IconButton>
      </div>
    </div>
  );
};

const logoCss = css`
  font-size: 20px;
  color: ${themed.color.brand.primary};
`;
