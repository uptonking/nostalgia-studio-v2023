import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../../../store';
import {
  menuPadding,
  showListItemActionsMenu,
  hideListItemActionsMenu,
  setRepoViewType,
  openAndViewMaterialFile,
  enableMsg,
  setMsgOption,
} from '../../../../store/repo/actions';
import { getMaterialFileTypeByFilename } from '../../../../utils/repo-files-link-utils';
import FileTbaleFileItemCheck from './FileTableFileItemCheck';
import FileTableFileItemRename from './FileTableFileItemRename';
import { SERVER_BASE_URL } from '../../../../common/constants';
import { axiosPost } from '../../../../services/repoService';

/**
 * 单个文件
 */
function FileTableFileItem(props) {
  const {
    state: {
      repo: {
        repoName,
        editorItems,
        menuState,
        menuRelativePath,
        renameState,
        renameRelativePath,
        currentRequestPath,
      },
    },
    dispatch,
  } = useGlobalContext();

  const navigate = useNavigate();

  // console.log(';;pps4 FileTableFileItem, ', props);

  /** 显示右键菜单的事件处理函数；
   */
  const handleShowListItemCtxMenuClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.button === 2) {
        if (menuRelativePath !== props.relativePath || menuState !== true) {
          dispatch(
            showListItemActionsMenu({
              menuType: 'file',
              menuTarget: props.linkTarget,
              menuRelativePath: props.relativePath,
              menuShortName: props.shortPath,
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

  const handleOpenFileClick = useCallback(() => {
    dispatch(hideListItemActionsMenu());

    const openingFileType = getMaterialFileTypeByFilename(props.shortPath);
    console.log(';;open-ing-file, ', props.shortPath, openingFileType);

    /** 下载文件内容并打开文件进行
     * todo 打开文件后默认只查看，不可编辑
     * todo 优化缓存，不用每次都重新下载
     */
    const ajaxData = async () => {
      const res: any = await axiosPost(
        `${SERVER_BASE_URL}/materials/file/contents`,
        {
          repoName,
          requestPath: props.relativePath,
        },
      );
      // console.log(';;ajax-res-getFileContents, ', props.relativePath, res);
      console.log(';;ajax-res-getFileContents, ', props.relativePath);

      if (res['code'] && res.code === -1) {
        console.log(';;/获取文件内容失败, ', res.state);

        dispatch(
          setMsgOption({
            msgType: 'openFile',
            msgContent: `打开文件失败: ${res.state}`,
            currentRequestPath,
          }),
        );
        dispatch(enableMsg());
      }

      // 有可能是空文件
      if (res || res === '') {
        dispatch(
          openAndViewMaterialFile({
            repoViewType: 'file-viewer',
            openingFileRepo: repoName,
            openingFileType,
            openingFilename: props.shortPath,
            openingFileMetadata: props,
            openingFileContentCache: res,
          }),
        );
      }
    };

    if (openingFileType === 'unsupported') {
      dispatch(
        openAndViewMaterialFile({
          repoViewType: 'file-viewer',
          openingFileRepo: repoName,
          openingFileType,
          openingFilename: props.shortPath,
          openingFileMetadata: props,
        }),
      );
    } else {
      ajaxData();
    }
    navigate(props.linkTarget);
  }, [currentRequestPath, dispatch, navigate, props, repoName]);

  return (
    <tr className='fm-table-file' onMouseDown={handleShowListItemCtxMenuClick}>
      <td className='son-inline-block-center relative'>
        <FileTbaleFileItemCheck {...props} />
        <i className='fa fa-file-text-o text-black-50 fa-lg fa-fw' />

        {renameState && renameRelativePath === props.relativePath ? (
          <FileTableFileItemRename {...props} />
        ) : (
          <span
            className='text-body cursor-pointer'
            // to={props.preview ? props.linkPreview : props.linkTarget}
            onClick={handleOpenFileClick}
          >
            {props.shortPath}
          </span>
        )}

        {
          // editorItems && editorItems[props.relativePath] ? (
          //   <FileTableFileItemSubmit {...props} />
          // ) : null
        }
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

export default FileTableFileItem;
