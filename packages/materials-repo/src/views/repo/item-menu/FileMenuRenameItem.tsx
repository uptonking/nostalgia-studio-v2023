import React, { useCallback } from 'react';
import { useGlobalContext } from '../../../store';
import { renameItemStart } from '../../../store/repo/actions';

function FileMenuRenameItem() {
  const {
    state: {
      repo: { menuRelativePath, menuShortName },
    },
    dispatch,
  } = useGlobalContext();

  /** 执行重命名 */
  const handleRenameClick = useCallback(() => {
    dispatch(renameItemStart({ menuRelativePath }));
  }, [dispatch, menuRelativePath]);

  return (
    <li
      className='fm-context-item overflow relative '
      onClick={handleRenameClick}
    >
      <i className='fa fa-pencil' />
      <span>重命名</span>
    </li>
  );
}

export default FileMenuRenameItem;
