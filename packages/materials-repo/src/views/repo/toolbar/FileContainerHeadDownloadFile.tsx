import React, { useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../../../store';
// import { downloadFile } from '../../tools/requestData';
// import { useDispatch, useSelector } from 'react-redux';

// 文件下载
function FileContainerHeadDownloadFile() {
  // const link = useRef<HTMLAnchorElement>();
  // let location = useLocation();
  // let dispatch = useDispatch();
  // let { msgState, msgType, data, currentRequestPath } = useSelector(
  //   (state) => state,
  // );
  const {
    state: {
      repo: { repoName, msgState, msgType, data, currentRequestPath },
    },
    dispatch,
  } = useGlobalContext();

  /** 文件下载，不支持下载文件夹；
   * todo 这里的实现是依次下载多个文件，而不是一次性打包下载
   */
  const downloadHandler = useCallback(() => {
    // if (fileList.length) {
    //   console.log();
    //   fileList.forEach((it) => downloadFile(it.relativePath, it.shortPath));
    //   dispatch({
    //     type: 'changeFileItemToUnCheck',
    //   });
    // } else {
    //   dispatch({
    //     type: 'setMsgOption',
    //     msgType: 'downloadFile',
    //     currentRequestPath,
    //     msgContent: '未选择文件下载！',
    //   });
    //   dispatch({ type: 'enableMsg' });
    // }
  }, [data, dispatch, currentRequestPath]);

  return (
    <label className='inline-flex-center' onClick={downloadHandler}>
      <span className='block'>
        <i className='fa fa-download' />
        下载选中
      </span>
    </label>
  );
}

export default FileContainerHeadDownloadFile;
