import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

import { listItemsForPath } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import {
  disableMsg,
  refreshFilesForPath,
  setIsRepoDataLoaded,
  setRepoViewType,
} from '../../../store/repo/actions';
import {
  addExtAndLinkToFiles,
  getRelativePathFromRepoPathname,
} from '../../../utils/repo-files-link-utils';

/**
 * 显示当前文件夹所在位置的路径指示器，使用breadcrumb面包屑形式
 */
function PathIndicator() {
  const {
    state: {
      repo: {
        repoName,
        repoViewType,
        data,
        currentRequestPathArr,
        sortMethod,
        sortFlag,
      },
    },
    dispatch,
  } = useGlobalContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // console.log(';;PathIndicator-currentRequestPathArr, ', currentRequestPathArr);

  /** 从当前地址url中获取根目录，如 /admin/ak/repo/a.md > /admin/ak/repo */
  const repoRootPath = useMemo(() => {
    if (!pathname.includes('/repo')) {
      return '/';
    }

    const pathArr = pathname.split('/');
    return pathArr.slice(0, 4).join('/');
  }, [pathname]);

  /** 点击链接时会立刻发起请求新数据 */
  const handlePathLinkClick = useCallback(
    (linkToPath: string) => {
      // console.log(';;PathIndicator-onClick ');
      const ajaxData = async (pathUrl: string) => {
        dispatch(setIsRepoDataLoaded(false));

        if (repoViewType !== 'file-manager') {
          dispatch(setRepoViewType({ repoViewType: 'file-manager' }));
        }

        const requestPath = getRelativePathFromRepoPathname(
          decodeURIComponent(pathUrl),
        );

        try {
          // 请求最新文件，并添加到action对象
          const resData: any = await listItemsForPath({
            repoName,
            requestPath,
          });

          console.log(`;;ajax-res-PathIndicator ${pathUrl}, `, resData.state);

          if (resData.code === 0) {
            let latestLinkedFiles = [];
            if (resData.state.files.length > 0) {
              latestLinkedFiles = addExtAndLinkToFiles(resData.state.files);
              // console.log(';;刷新成功后的数据, ', data);
            } else {
              console.log(';;empty files, please upload files');
            }

            dispatch(
              refreshFilesForPath({
                repoData: {
                  ...resData.state,
                  files: latestLinkedFiles,
                },
                currentRequestPath: getRelativePathFromRepoPathname(
                  decodeURIComponent(pathname),
                ),
                sortMethod,
                sortFlag,
                menuState: false,
              }),
            );

            dispatch(disableMsg());
          }

          if (resData.code === -1) {
            console.log(`// 请求${pathUrl}数据失败, `, resData.state);
          }
        } catch (err) {
          console.log(';;err-handlePathLinkClick, ', err);
        }
      };

      ajaxData(linkToPath);
    },
    [dispatch, pathname, repoName, repoViewType, sortFlag, sortMethod],
  );

  const handleRootPathClick = useCallback(() => {
    handlePathLinkClick(repoRootPath);
    // return true;
    navigate(repoRootPath);
  }, [handlePathLinkClick, navigate, repoRootPath]);

  const handleMidPathClick = useCallback(() => {
    dispatch(setRepoViewType({ repoViewType: 'file-manager' }));
  }, [dispatch]);

  let pre = '';
  return (
    <Breadcrumb className='path-breadcrumb'>
      <BreadcrumbItem>
        <Link to={repoRootPath} onClick={handleRootPathClick}>
          全部文件
        </Link>
      </BreadcrumbItem>

      {
        // 点击上面的全部文件，会立刻发起新数据请求，然后修改到目标url，可用于强制刷新；
        // 点击中间路径url，会先修改到目标url，然后在目标url页面组件发起新数据请求，并不一定发起
        currentRequestPathArr.map((path, index) => {
          pre += path;
          return (
            <BreadcrumbItem key={index}>
              <Link to={pre} onClick={handleMidPathClick}>
                {path.replace('/', '')}
              </Link>
            </BreadcrumbItem>
          );
        })
      }

      {/* <BreadcrumbItem active>Data</BreadcrumbItem> */}
    </Breadcrumb>
  );
}

export default PathIndicator;
