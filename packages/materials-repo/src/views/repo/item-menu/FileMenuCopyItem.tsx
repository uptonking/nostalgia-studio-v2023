import React, { useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../../../store';
import { hideListItemActionsMenu } from '../../../store/repo/actions';

// 复制文件选项
function FileMenuCopyItem() {
  const {
    state: {
      repo: {
        repoName,
        data,
        msgType,
        msgState,
        copyShortName,
        copyFileState,
        currentRequestPath,
        copyFileAtDirRelativePath,
      },
    },
    dispatch,
  } = useGlobalContext();

  const linkRef = useRef<HTMLAnchorElement>();
  const location = useLocation();

  // 复制按钮点击
  const copyHandler = useCallback(() => {
    // if (!copyFileState) {
    //   dispatch({
    //     type: 'copyFileStart',
    //   });
    // } else {
    console.log(';; ---- fake copying file ---- ');
    // copyFile(
    //   copyShortName,
    //   copyFileAtDirRelativePath,
    //   data.relativePath,
    // ).then((res) => {
    //   if (res.code === 0) {
    //     dispatch({
    //       type: 'copyFileSuccess',
    //       isSamePath: false,
    //       currentRequestPath,
    //       shortPath: copyShortName,
    //     });
    //     dispatch({ type: 'menuPadding' });
    //   } else {
    //     // 出错
    //     dispatch({
    //       type: 'setMsgOption',
    //       msgType: 'copyFile',
    //       currentRequestPath,
    //       msgContent: '复制文件出错,存在同名文件或者空间不足',
    //     });
    //     dispatch({ type: 'enableMsg' });
    //     dispatch({ type: 'menuHide' });
    //   }
    //   dispatch({ type: 'copyFileComplated' });
    // });
    // }
    dispatch(hideListItemActionsMenu());
  }, [dispatch]);

  // useEffect(() => {
  //   if (msgState && msgType === 'copyFile' && linkRef.current) {
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
        //     // to={{ pathname: '/msg', state: { background: location } }}
        //   />
        // )
      }
      <li className='fm-context-item overflow relative' onClick={copyHandler}>
        <i className='fa fa-copy' />
        <span>{copyFileState ? '粘贴' : '复制'}</span>
      </li>
    </>
  );
}

export default FileMenuCopyItem;
