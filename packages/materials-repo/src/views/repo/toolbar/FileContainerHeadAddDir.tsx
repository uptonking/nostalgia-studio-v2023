import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDir } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import {
  createFolderSuccess,
  setMsgOption,
  enableMsg,
} from '../../../store/repo/actions';
import { generateNewFolderName } from '../../../utils/repo-files-link-utils';

/** 新建文件夹的按钮 */
function AddFolderActionButton() {
  const {
    state: {
      repo: {
        repoName,
        newFolderName,
        msgState,
        msgType,
        data,
        currentRequestPath,
      },
    },
    dispatch,
  } = useGlobalContext();
  const linkRef = useRef<HTMLAnchorElement>();
  // const [newFolderSuffix, setNewFolderSuffix] = useState(0);

  // console.log(';;AddFolderBtn-data, ', data);

  /** 添加文件夹；
   * todo 优化新建文件夹的流程，执行ajax前先重命名，若修改了名称则再发送改名请求，否则不用
   */
  const handleAddFolderClick = useCallback(() => {
    const curNewFolderName = generateNewFolderName({
      data,
      newFolderName,
      newType: 'dir',
    });
    console.log(';;新建文件夹的名称, ', curNewFolderName);

    const ajaxData = async () => {
      // ajax在服务器创建新文件夹
      const resData: any = await addDir({
        repoName,
        relativePath: data.relativePath,
        folderName: curNewFolderName,
      });
      console.log(';;ajax-res-addFolder, ', resData.state);

      if (resData.code === 0) {
        // 更新界面
        dispatch(
          createFolderSuccess({ repoData: data, folderName: curNewFolderName }),
        );
      }

      if (resData.code === -1) {
        console.log(';;新建文件夹失败, ', resData);

        dispatch(
          setMsgOption({
            msgType: 'addDir',
            msgContent: `新建文件夹失败,存在同名文件夹 ${curNewFolderName}`,
            currentRequestPath,
          }),
        );
        dispatch(enableMsg());
      }
    };

    ajaxData();
  }, [data, newFolderName, repoName, dispatch, currentRequestPath]);

  // 自动点击,进入模态窗口
  // useEffect(() => {
  //   if (msgState && msgType === 'addDir' && linkRef.current) {
  //     console.log(';;addFolder linkRef.current.click()');
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
      <label className='inline-flex-center' onClick={handleAddFolderClick}>
        <span className='block'>
          <i className='fa fa-folder-o' />
          新建文件夹
        </span>
      </label>
    </>
  );
}

export default AddFolderActionButton;
