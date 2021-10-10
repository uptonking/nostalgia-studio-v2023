import React, { useCallback } from 'react';
import { useGlobalContext } from '../../../../store';
import FileTableBody from './FileTableBody';

/** 文件列表视图组件，表头描述 + 文件夹/文件列表 */
function FileTable() {
  const {
    state: {
      repo: { menuState, isLoaded, copyFileState },
    },
    dispatch,
  } = useGlobalContext();
  // console.log(';;FileTable-isLoaded, ', isLoaded);

  const bodyMenuHandler = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.button === 2 && copyFileState) {
        // 如果点击了右键
        if (menuState !== true) {
          // dispatch({
          //   type: 'menuShow',
          //   menuType: 'body',
          //   x: e.pageX + 20,
          //   y: e.pageY,
          // });
        } else {
          // dispatch({
          //   type: 'menuPadding',
          // });
        }
      }
    },
    [menuState, copyFileState],
  );

  return (
    <div className='fm-table relative mt-2' onMouseDown={bodyMenuHandler}>
      <table className='fm-table-show'>
        <thead className='text-muted'>
          <tr>
            <th>文件名</th>
            <th>修改日期</th>
            <th>大小</th>
          </tr>
        </thead>
        {isLoaded && <FileTableBody />}
        {/* <FileTableBody /> */}
      </table>
    </div>
  );
}

export default FileTable;
