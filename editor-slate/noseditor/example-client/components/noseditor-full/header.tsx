import React, { useCallback, useEffect, useState } from 'react';

import {
  Edit as EditIcon,
  PreviewOpen as ViewOnlyIcon,
  Refresh as ResetIcon,
} from '@icon-park/react';

import { IconButton } from '../../../src';

type NosNavbarProps = {
  isReadOnly: boolean;
  setIsReadOnly: React.Dispatch<React.SetStateAction<boolean>>;
  resetEditorContents: () => void;
};

export const NosNavbar = (props: NosNavbarProps) => {
  const { isReadOnly, setIsReadOnly, resetEditorContents } = props;

  const handleResetEditorContent = useCallback(() => {
    if (window.confirm('Are you sure you want to reset Content ？')) {
      resetEditorContents();
    }
  }, [resetEditorContents]);

  return (
    <div className='nosedit-navbar'>
      <div className='nosedit-logo'>NosEditor</div>

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
