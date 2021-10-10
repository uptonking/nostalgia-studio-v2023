import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import { listItemsForPath, uploadFile } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import {
  setIsRepoDataLoaded,
  setMsgOption,
  uploadFileSuccess,
  enableMsg,
} from '../../../store/repo/actions';
import {
  addExtAndLinkToFiles,
  getRelativePathFromRepoPathname,
} from '../../../utils/repo-files-link-utils';

/** 上传文件的按钮 */
function UploadFileActionButton() {
  const { pathname } = useLocation();

  const uploadInputRef = useRef<HTMLInputElement>();
  const linkRef = useRef<HTMLAnchorElement>();
  const [disable, setDisable] = useState(false);

  const {
    state: {
      repo: { repoName, msgState, msgType, data, currentRequestPath },
    },
    dispatch,
  } = useGlobalContext();

  // console.log(
  //   ';;pps4 FileUploader, ',
  //   data,
  //   currentRequestPath,
  //   msgType,
  //   msgState,
  // );

  /** 上传单个文件。
   * todo 上传文件存在同名文件时，自动重命名 - 副本(1)
   */
  const handleUploadFileClick = useCallback(() => {
    const uploadFormData = new FormData();
    // 上传的路径
    uploadFormData.append('repoName', repoName);
    uploadFormData.append('uploadFolder', data.relativePath);
    // console.log(';;formdata-uploadFolder, ', uploadRelativePath);
    // 上传的单个文件对象
    uploadFormData.append('file', uploadInputRef.current.files[0]);
    // 文件名
    const fileName = uploadInputRef.current.files[0].name.split(/\s+/).join('');
    // 不可再次点击上传
    setDisable(true);

    const ajaxData = async () => {
      // ajax上传文件
      const upResData: any = await uploadFile(
        uploadInputRef.current.parentElement,
        uploadFormData,
      );

      if (upResData.code === -1) {
        console.log(';;/上传文件失败, ', upResData);

        uploadInputRef.current.parentElement.style.backgroundImage = 'none';

        dispatch(enableMsg());
        dispatch(
          setMsgOption({
            msgType: 'uploadFile',
            msgContent: '上传文件失败，文件已经存在或者空间不足',
            currentRequestPath,
          }),
        );
        return;
      }

      // if (upResData.code === 0) {
      const relativePath = data.relativePath
        ? data.relativePath + '/' + fileName
        : fileName;
      console.log(';;上传成功后-relativePath, ', relativePath);
      uploadInputRef.current.parentElement.style.backgroundImage = 'none';

      dispatch(setIsRepoDataLoaded(false));

      const requestPath = getRelativePathFromRepoPathname(
        decodeURIComponent(pathname),
      );

      // ajax请求最新文件，并添加到action对象
      const resData: any = await listItemsForPath({
        requestPath,
        repoName,
      });

      console.log(';;ajax/uploaded, ', resData.state);
      if (resData.code === 0) {
        if (resData.state.files.length > 0) {
          const latestLinkedFiles = addExtAndLinkToFiles(resData.state.files);
          dispatch(
            uploadFileSuccess({
              repoData: data,
              relativePath,
              files: latestLinkedFiles,
            }),
          );
        } else {
          console.log(';;empty files list');
          dispatch(setIsRepoDataLoaded(true));
        }
      }
      if (resData.code === -1) {
        console.log('// upload-上传后请求当前目录数据失败, ', resData.state);
      }
    };

    ajaxData();

    setDisable(false);
    uploadInputRef.current.value = '';
  }, [data, repoName, dispatch, pathname, currentRequestPath]);

  // useEffect(() => {
  //   if (msgState && msgType === 'uploadFile' && linkRef.current) {
  //     linkRef.current.click();
  //   }
  // }, [msgState, msgType]);

  return (
    <label className='inline-flex-center' htmlFor='upload'>
      {
        // msgState && (
        //   <Link
        //     ref={linkRef}
        //     className='none'
        //     to={{ pathname: '/msg' }}
        //     // to={{ pathname: '/msg', state: { background: location } }}
        //   />
        // )
      }
      <i className='fa fa-upload block' />
      上传
      {/* 上传输入框一直是视觉上隐藏的，display: none */}
      <input
        type='file'
        id='upload'
        className='fm-header-btnUpload'
        onChange={handleUploadFileClick}
        ref={uploadInputRef}
        disabled={disable}
      />
    </label>
  );
}

export default UploadFileActionButton;
