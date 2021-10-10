import React, { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { addFile } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import {
  createFileSuccess,
  setMsgOption,
  enableMsg,
} from '../../../store/repo/actions';
import { generateNewFileName } from '../../../utils/repo-files-link-utils';

/** 新建文件 */
function AddFileActionButton() {
  const {
    state: {
      repo: {
        repoName,
        newFilename: newFileName,
        newFilenameSuffix: newFileNameSuffix,
        msgState,
        msgType,
        data,
        currentRequestPath,
      },
    },
    dispatch,
  } = useGlobalContext();
  const linkRef = useRef<HTMLAnchorElement>();

  /**
   * 添加文件
   */
  const handleAddFileClick = useCallback(() => {
    const curNewFileName = generateNewFileName({
      data,
      newFileName: newFileName,
      newFileNameSuffix,
      newType: 'file',
    });
    console.log(';;新建文件的名称, ', curNewFileName);

    const ajaxData = async () => {
      // ajax在服务器创建新文本文件
      const resData: any = await addFile({
        repoName,
        relativePath: data.relativePath,
        fileName: curNewFileName,
      });
      console.log(';;ajax-res-addFile, ', resData.state);

      if (resData.code === 0) {
        // 更新界面
        dispatch(
          createFileSuccess({ repoData: data, fileName: curNewFileName }),
        );
      }

      if (resData.code === -1) {
        console.log(';;/新建文件失败, ', resData);

        dispatch(
          setMsgOption({
            msgType: 'addDir',
            msgContent: `新建文件失败,存在同名文件 ${curNewFileName}`,
            currentRequestPath,
          }),
        );
        dispatch(enableMsg());
      }
    };

    ajaxData();
  }, [
    data,
    newFileName,
    newFileNameSuffix,
    repoName,
    dispatch,
    currentRequestPath,
  ]);

  // 自动点击,进入模态窗口
  // useEffect(() => {
  //   if (msgState && msgType === 'addFile' && linkRef.current) {
  //     console.log(';;addFile linkRef.current.click()');
  //     linkRef.current.click();
  //   }
  // }, [msgState, msgType]);

  return (
    <>
      {
        // msgState && (
        //   <Link
        //     ref={linkRef}
        //     className='none'
        //     to={{ pathname: '/msg' }}
        //     // to={{ pathname: "/msg", state: { background: location } }}
        //   />
        // )
      }
      <label className='inline-flex-center' onClick={handleAddFileClick}>
        <span className='block'>
          <i className='fa fa-file-o' />
          新建文件
        </span>
      </label>
    </>
  );
}

export default AddFileActionButton;
