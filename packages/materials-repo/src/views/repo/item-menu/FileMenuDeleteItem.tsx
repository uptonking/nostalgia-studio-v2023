import React, { useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deleteFiles } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import {
  deleteEditorItem,
  enableMsg,
  hideListItemActionsMenu,
  menuPadding,
  refreshId,
  removeItemSuccess,
  setMsgOption,
} from '../../../store/repo/actions';

/** 直接删除文件的按钮，而不是移动文件到回收站 */
function FileMenuDeleteItem() {
  const {
    state: {
      repo: {
        repoName,
        data,
        currentRequestPath,
        menuRelativePath,
        menuType,
        menuShortName,
        editorItems,
      },
    },
    dispatch,
  } = useGlobalContext();

  /** 删除单个文件夹或文件 */
  const handleDeleteItemClick = useCallback(() => {
    console.log(';;menuShortName, ', menuShortName, menuRelativePath);
    dispatch(hideListItemActionsMenu());

    const ajaxData = async () => {
      // ajax在服务器删除文件
      const resData: any = await deleteFiles({
        repoName,
        files: [{ path: menuRelativePath, type: menuType }],
      });
      console.log(';;ajax-res-deleteFiles, ', resData.state);

      if (resData.code === 0) {
        // 更新界面
        dispatch(
          removeItemSuccess({
            shortPath: menuShortName,
            repoData: data,
          }),
        );
        if (menuType === 'file') {
          // 编辑内容删除
          dispatch(
            deleteEditorItem({ relativePath: menuRelativePath, editorItems }),
          );
        }

        // 刷新id，逻辑已被合并到上面
        // dispatch(refreshId({ repoData: data }));
        // 菜单消失
        // dispatch(menuPadding());
      }

      if (resData.code === -1) {
        console.log(';;/删除失败, ', resData);

        dispatch(
          setMsgOption({
            msgType: 'deleteFile',
            msgContent: `删除失败`,
            currentRequestPath,
          }),
        );
        dispatch(enableMsg());
      }
    };

    ajaxData();
  }, [
    menuShortName,
    menuRelativePath,
    repoName,
    menuType,
    dispatch,
    data,
    editorItems,
    currentRequestPath,
  ]);

  return (
    <li
      className='fm-context-item overflow relative'
      onClick={handleDeleteItemClick}
    >
      <i className='fa fa-remove' style={{}} />
      <span>删除</span>
    </li>
  );
}

export default FileMenuDeleteItem;
