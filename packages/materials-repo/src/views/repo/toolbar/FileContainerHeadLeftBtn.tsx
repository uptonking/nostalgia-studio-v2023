import * as React from 'react';
import FileContainerHeadUploadFile from './FileContainerHeadUploadFile';
import AddFileActionButton from './FileContainerHeadAddFile';
import AddFolderActionButton from './FileContainerHeadAddDir';
import FileContainerHeadDownloadFile from './FileContainerHeadDownloadFile';

/** 4个按钮，上传、新建文件、新建目录、下载文件 */
function FileContainerHeadLeftBtn() {
  return (
    <div className='fm-table-header-leftBtns son-input-allHidden'>
      <FileContainerHeadUploadFile />
      <AddFileActionButton />
      <AddFolderActionButton />
      {/* <FileContainerHeadDownloadFile /> */}
    </div>
  );
}

export default FileContainerHeadLeftBtn;
