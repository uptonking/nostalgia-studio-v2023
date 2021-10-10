import React, { useCallback } from 'react';
import { downloadFile } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import {
  setMsgOption,
  enableMsg,
  hideListItemActionsMenu,
} from '../../../store/repo/actions';

/** 下载文件，菜单不会出现在文件夹上 */
function DownloadFileMenuItem() {
  const {
    state: {
      repo: {
        repoName,
        data,
        currentRequestPath,
        menuRelativePath,
        menuShortName,
      },
    },
    dispatch,
  } = useGlobalContext();

  /** 下载当前文件 */
  const handleDownloadFileClick = useCallback(() => {
    dispatch(hideListItemActionsMenu());

    const ajaxData = async () => {
      // ajax在服务器删除文件
      const res: any = await downloadFile({
        repoName,
        relativePath: menuRelativePath,
        fileName: menuShortName,
      });
      console.log(';;ajax-res-downloadFile, ', res);

      if (res.status === 200) {
        // 成功下载文件内容

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', menuShortName);
        document.body.append(link);
        link.click();
        URL.revokeObjectURL(link.href);
        link.remove();
      }

      if (res.status !== 200) {
        console.log(';;/下载失败, ', res);

        dispatch(
          setMsgOption({
            msgType: 'downloadFile',
            msgContent: `下载失败: ${res.state}`,
            currentRequestPath,
          }),
        );
        dispatch(enableMsg());
      }
    };

    ajaxData();
  }, [currentRequestPath, dispatch, menuRelativePath, menuShortName, repoName]);

  return (
    <li
      className='fm-context-item overflow relative'
      onClick={handleDownloadFileClick}
    >
      <i className='fa fa-download' />
      <span>下载</span>
    </li>
  );
}

export default DownloadFileMenuItem;
