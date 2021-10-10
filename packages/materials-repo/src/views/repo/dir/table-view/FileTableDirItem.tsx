import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Label, Input } from 'reactstrap';
import { useGlobalContext } from '../../../../store';
import {
  showListItemActionsMenu,
  menuPadding,
  hideListItemActionsMenu,
} from '../../../../store/repo/actions';
import FileTableDirItemRename from './FileTableDirItemRename';

/** 单个文件夹 */
function FileTableDirItem(props) {
  const {
    state: {
      repo: { menuState, menuRelativePath, renameState, renameRelativePath },
    },
    dispatch,
  } = useGlobalContext();

  /** 显示右键菜单的事件处理函数；
   */
  const handleShowListItemCtxMenuClick = useCallback(
    (e) => {
      e.stopPropagation();
      // console.log(';;DirItem-onMouseDown');
      if (e.button === 2) {
        if (menuRelativePath !== props.relativePath || menuState !== true) {
          // console.log(';; DirItem-弹出右键菜单');
          dispatch(
            showListItemActionsMenu({
              menuType: 'dir',
              menuShortName: props.shortPath,
              menuRelativePath: props.relativePath,
              menuMaterialItem: props,
              x: e.pageX + 20,
              y: e.pageY,
            }),
          );
        } else {
          dispatch(menuPadding());
        }
      }
    },
    [menuRelativePath, props, menuState, dispatch],
  );

  const handleOpenFolderClick = useCallback(() => {
    console.log('直接打开文件夹url');
    dispatch(hideListItemActionsMenu());

    return true;
  }, [dispatch]);

  return (
    <tr
      className='fm-table-folder'
      onMouseDown={handleShowListItemCtxMenuClick}
    >
      <td className='son-inline-block-center relative'>
        <Label check={!!props.checked} className='pr-2'>
          <Input
            type='checkbox'
            // onClick={checkHandler}
          />
        </Label>
        <i className='fa fa-folder fa-lg text-warning fa-fw' />

        {renameState && renameRelativePath === props.relativePath ? (
          <FileTableDirItemRename {...props} />
        ) : (
          <Link
            className='text-body'
            to={props.linkTarget}
            onClick={handleOpenFolderClick}
          >
            {props.shortPath}
          </Link>
        )}
      </td>

      <td>
        <span>{props.modifyTime}</span>
      </td>
      <td>
        <span>{props.readAbleLength}</span>
      </td>
    </tr>
  );
}

export default FileTableDirItem;
