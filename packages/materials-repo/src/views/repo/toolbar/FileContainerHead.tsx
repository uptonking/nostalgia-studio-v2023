import * as React from 'react';
import FileContainerHeadLeftBtn from './FileContainerHeadLeftBtn';
import FileContainerHeadRightBtn from './FileContainerHeadRightBtn';

/** 文件列表之上的操作菜单条，包括 新建、上传、切换显示模式 */
export function FileContainerHead() {
  return (
    <div className='fm-table-header flex relative'>
      <FileContainerHeadLeftBtn />
      {/* <FileContainerHeadRightBtn /> */}
    </div>
  );
}

// export default React.memo(FileContainerHead);
export default FileContainerHead;
