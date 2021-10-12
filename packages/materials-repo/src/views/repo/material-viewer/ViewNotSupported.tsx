import * as React from 'react';
import { useLocation } from 'react-router-dom';
import useKeyboardJs from 'react-use/lib/useKeyboardJs';

import { useGlobalContext } from '../../../store';
import { setRepoViewType } from '../../../store/repo/actions';

export function ViewNotSupported() {
  const {
    state: {
      repo: { repoName, repoViewType, openingFileType, openingFilename },
    },
    dispatch,
  } = useGlobalContext();

  const { pathname } = useLocation();

  const [isNavBackPreseed] = useKeyboardJs([
    'alt + left',
    'alt > left',
    'left > alt',
  ]);
  const contentReadOnly = true;
  console.log(';;isNavBackPreseed, ', isNavBackPreseed);
  if (contentReadOnly && pathname.includes('/repo') && isNavBackPreseed) {
    dispatch(setRepoViewType({ repoViewType: 'file-manager' }));
  }

  return (
    <div
      style={{
        minWidth: `60vw`,
        // width: `100%`,
      }}
    >
      <h3>文件: {openingFilename}</h3>
      <p>本文件格式暂不支持查看，建议下载到本地后用其他软件查看</p>
    </div>
  );
}

export default ViewNotSupported;
