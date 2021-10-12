import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { listItemsForPath } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import { setMiniAppConfig } from '../../../store/mini-app/actions';
import {
  enableMsg,
  hideListItemActionsMenu,
  setMsgOption,
} from '../../../store/repo/actions';
import { setLogoText } from '../../../store/settings/actions';
import { getRelativePathFromRepoPathname } from '../../../utils/repo-files-link-utils';

function OpenAsMiniAppMenuItem() {
  const {
    state: {
      user,
      repo: {
        repoName,
        menuRelativePath,
        menuShortName,
        menuMaterialItem,
        currentRequestPath,
      },
      miniApp: { miniAppName },
    },
    dispatch,
  } = useGlobalContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const curRelativePath = getRelativePathFromRepoPathname(
    decodeURIComponent(pathname),
  );
  const requestPath =
    curRelativePath === ''
      ? menuShortName
      : curRelativePath + '/' + menuShortName;

  /** 打开资料小程序的ajax逻辑 */
  const handleOpenAsMiniAppClick = useCallback(() => {
    dispatch(hideListItemActionsMenu());

    // console.log(';;open-ing-file, ', props.shortPath, openingFileType);

    let supportedDocs = [];

    /** 获取该文件夹的内容
     */
    const ajaxData = async () => {
      console.log(';; open-mini-app-path, ', requestPath);

      const resData: any = await listItemsForPath({
        repoName,
        requestPath,
      });

      console.log(';;ajax-res/open-mini-app, ', resData.state);

      if (resData.code === -1) {
        console.log(';;/请求文件夹内容失败, ', resData.state);

        dispatch(
          setMsgOption({
            msgType: 'openMiniApp',
            msgContent: `打开文件夹失败: ${resData.state}`,
            currentRequestPath,
          }),
        );
        dispatch(enableMsg());
      }

      if (resData.code === 0) {
        supportedDocs = resData.state.files.filter(
          (item) =>
            item.fileType === 'file' &&
            (item.shortPath.endsWith('.md') || item.shortPath.endsWith('.mdx')),
        );

        if (supportedDocs.length === 0) {
          // 如果该文件夹下没有符合条件的文档
          dispatch(
            setMsgOption({
              msgType: 'openAsMiniApp',
              msgContent: `${menuShortName}: 该文件夹下没有以.md或.mdx结尾的文档`,
              currentRequestPath,
            }),
          );
          dispatch(enableMsg());
          return;
        }

        const miniAppRoutesConfig = supportedDocs.map((item) => ({
          path: item.shortPath,
          name: item.shortPath,
        }));

        // todo 根据路径自动重命名同名小程序
        dispatch(
          setMiniAppConfig({
            miniAppOwner: user.user.username,
            miniAppName:
              menuShortName.length > 10
                ? menuShortName.substring(0, 9)
                : menuShortName,
            miniAppId:
              user.user.username + '/' + repoName + '/' + menuRelativePath,
            miniAppRoutesConfig,
            miniAppDefaultRoot: requestPath,
          }),
        );

        navigate(`/pages/${user.user.username}/${menuShortName}/app`);
      }
    };

    ajaxData();
  }, [
    currentRequestPath,
    dispatch,
    menuRelativePath,
    menuShortName,
    navigate,
    repoName,
    requestPath,
    user.user.username,
  ]);

  return (
    <li
      className='fm-context-item overflow relative '
      // onClick={handleRenameClick}
    >
      <i className='fa fa-link' />
      {/* <Link to={`/pages/${user.user}/${miniAppName}/app`}>
        以资料小程序的方式打开
      </Link> */}
      <span
        className='text-body cursor-pointer'
        // to={props.preview ? props.linkPreview : props.linkTarget}
        onClick={handleOpenAsMiniAppClick}
      >
        以资料小程序的方式打开
      </span>
    </li>
  );
}

export default OpenAsMiniAppMenuItem;
