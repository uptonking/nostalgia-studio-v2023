import './base.scss';
import './dir.scss';

import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';

import { listItemsForPath } from '../../services/repoService';
import { useGlobalContext } from '../../store';
import {
  enableMsg,
  hideListItemActionsMenu,
  refreshFilesForPath,
  setIsRepoDataLoaded,
  setMsgOption,
  setRepoViewType,
} from '../../store/repo/actions';
import {
  setSidePanelType,
  setSidebarType,
  setSidebarVisibleMode,
  setLogoText,
} from '../../store/settings/actions';
import {
  addExtAndLinkToFiles,
  getRelativePathFromRepoPathname,
  removeTrailingSlashIfExists,
} from '../../utils/repo-files-link-utils';
import MsgContainer from './components/msg/MsgContainer';
import FileContainer from './dir/FileContainer';
import FileViewer from './material-viewer/FileViewer';
import { PathIndicator } from './path-indicator';

type RepoViewerProps = {
  title?: string;
};

/**
 * 类似github仓库的文件管理器/网盘/资料库。
 * ? 为什么跳转到本页面RoutesAll会匹配2次，但请求只发起一次
 */
export function RepoManager(props: RepoViewerProps) {
  const {
    state: {
      settings: { logoText },
      repo: {
        repoName,
        repoViewType,
        currentRequestPath,
        data,
        sortMethod,
        sortFlag,
        msgState,
      },
    },
    dispatch,
  } = useGlobalContext();

  const { pathname } = useLocation();
  const curRelativePath = getRelativePathFromRepoPathname(
    decodeURIComponent(pathname),
  );
  console.log(';;pps4 RepoMgr, ', curRelativePath);
  const contentReadOnly = true;

  useEffect(() => {
    // 当首次routing到资料库首页时，回到默认布局

    dispatch(setSidePanelType('dock'));
    // dispatch(setSidebarType('full'));
    // dispatch(setSidebarVisibleMode('hidden'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (repoName !== logoText) {
      dispatch(setLogoText({ logoText: repoName }));
    }
  }, [dispatch, logoText, repoName]);

  useEffect(() => {
    // 当每次routing到资料库首页时，恢复部分默认ui

    const pathArr = removeTrailingSlashIfExists(pathname).split('/');
    console.log(';;RepoMgr-pathArr, ', pathArr);

    if (contentReadOnly && pathArr.length === 4 && pathArr[3] === 'repo') {
      // dispatch(setRepoViewType({ repoViewType: 'file-manager' }));
      dispatch(hideListItemActionsMenu());
    }
  }, [contentReadOnly, dispatch, pathname]);

  // 这里默认只有url变化时才会重新发起请求，想强制刷新文件数据需要单独实现
  useEffect(() => {
    const shouldFetchData = !data || currentRequestPath !== curRelativePath;
    console.log(';;RepoMgr-shouldFetchData, ', shouldFetchData);
    // console.log(';;RepoMgr-data, ', data);
    // console.log(';;RepoMgr-data, ', data);

    if (repoViewType === 'file-manager' && shouldFetchData) {
      const ajaxData = async () => {
        dispatch(setIsRepoDataLoaded(false));

        const requestPath = getRelativePathFromRepoPathname(
          decodeURIComponent(pathname),
        );

        try {
          // 请求最新文件，并添加到action对象
          const resData: any = await listItemsForPath({
            repoName,
            requestPath,
          });

          console.log(';;ajax-res/refresh/all, ', resData.state);

          if (resData.code === -1) {
            console.log('请求当前目录数据失败, ', resData.state);

            dispatch(
              setMsgOption({
                msgType: 'refreshRepoFolder',
                msgContent: `请求当前目录数据失败:
                ${resData.state}`,
                currentRequestPath,
              }),
            );
            dispatch(enableMsg());
          }

          if (resData.code === 0) {
            let latestLinkedFiles = [];
            if (resData.state.files.length > 0) {
              latestLinkedFiles = addExtAndLinkToFiles(resData.state.files);
              // console.log(';;latestLinkedFiles, ', latestLinkedFiles);
            }

            dispatch(
              refreshFilesForPath({
                repoData: {
                  ...resData.state,
                  files: latestLinkedFiles,
                },
                currentRequestPath: curRelativePath,
                sortMethod,
                sortFlag,
              }),
            );
          }
        } catch (err) {
          console.log(';;err-RepoMgr-refreshFilesForPath, ', err);
        }
      };

      ajaxData();
    }
  }, [
    curRelativePath,
    currentRequestPath,
    data,
    dispatch,
    msgState,
    pathname,
    repoName,
    repoViewType,
    sortFlag,
    sortMethod,
  ]);
  // });

  // 注意实际样式是 overflow: hidden
  const memoedResultJsx = useMemo(
    () => (
      <Card>
        <CardBody>
          <div
            className='fm-container relative overflow'
            style={{ minHeight: '75vh' }}
          >
            <PathIndicator />
            {repoViewType === 'file-manager' && <FileContainer />}
            {repoViewType === 'file-viewer' && <FileViewer />}
            {msgState ? <MsgContainer /> : null}
          </div>
        </CardBody>
      </Card>
    ),
    [msgState, repoViewType],
  );

  return memoedResultJsx;
}

export default RepoManager;
