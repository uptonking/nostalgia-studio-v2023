import './mini-app.scss';

import * as React from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useKeyboardJs from 'react-use/lib/useKeyboardJs';
import { Card, CardBody } from 'reactstrap';
import Editor from 'rich-markdown-editor';
import * as tocbot from 'tocbot';

import { SERVER_BASE_URL } from '../../../common/constants';
import { axiosPost, submitFileContents } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import { addPageContentToCaches } from '../../../store/mini-app/actions';
import {
  deleteEditorItem,
  enableMsg,
  saveEditorItem,
  setMsgOption,
  setRepoViewType,
} from '../../../store/repo/actions';
import { setLogoText } from '../../../store/settings/actions';
import {
  getRelativePathFromPagePathname,
  getRelativePathFromRepoPathname,
  removeTrailingSlashIfExists,
} from '../../../utils/repo-files-link-utils';

type DocPageViewProps = {
  readOnly?: boolean;
};

export function DocPageView(props: DocPageViewProps) {
  const {
    state: {
      settings: { logoText },
      repo: { repoName },
      miniApp: {
        miniAppOwner,
        miniAppName,
        miniAppRoutesConfig,
        miniAppDefaultRoot,
        pagesContentsCaches,
        openingPagePath,
      },
    },
    dispatch,
  } = useGlobalContext();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const curRelativePath = getRelativePathFromPagePathname(
    decodeURIComponent(pathname),
  );
  let requestPagePath = '';
  if (curRelativePath === '') {
    requestPagePath = miniAppDefaultRoot + '/' + miniAppRoutesConfig[0]['path'];
  } else {
    requestPagePath = miniAppDefaultRoot + '/' + curRelativePath;
  }

  // console.log(';;pps4 DocPageView, ', curRelativePath, requestPagePath);
  // console.log(
  //   'pagesContentsCaches[requestPagePath], ',
  //   pagesContentsCaches[requestPagePath],
  // );

  useEffect(() => {
    // todo 减少请求次数，同时实现更新toc标题目录
    const shouldFetchData = !pagesContentsCaches[requestPagePath];
    // || openingPagePath !== requestPagePath;
    console.log(';;DocPage-shouldFetch, ', shouldFetchData, requestPagePath);

    if (shouldFetchData) {
      const ajaxData = async () => {
        const res: any = await axiosPost(
          `${SERVER_BASE_URL}/materials/file/contents`,
          {
            repoName,
            requestPath: requestPagePath,
          },
        );
        // console.log(';;ajax-res-getFileContents, ', res);
        console.log(';;ajax-res-getFileContents ');

        if (res['code'] && res.code === -1) {
          console.log(';;/获取文件内容失败, ', res.state);

          dispatch(
            setMsgOption({
              msgType: 'openFile',
              msgContent: `打开文件失败: ${res.state}`,
            }),
          );
          dispatch(enableMsg());
        }

        // 显示文件内容，注意有可能是空文件
        if (res || res === '') {
          dispatch(
            addPageContentToCaches({
              pagePath: requestPagePath,
              pageContent: res === '' ? ' ' : res,
              pagesContentsCaches,
              openingPagePath: requestPagePath,
            }),
          );
        }
      };

      ajaxData();
    }
  }, [
    dispatch,
    openingPagePath,
    pagesContentsCaches,
    repoName,
    requestPagePath,
  ]);

  useEffect(
    // 给文档中的标题h1-h6元素添加自动生成的id，直接操作dom，不依赖react状态数据
    // todo 暂时每次都会rerender，要在减少请求次数的同时，实现更新toc标题目录
    () => {
      const docContent = document.querySelector('.mini-app .ProseMirror');
      const headings = docContent.querySelectorAll(
        'h1 .heading-content, h2 .heading-content, h3 .heading-content, h4 .heading-content',
      );
      if (docContent && headings && headings.length) {
        const headingMap = {};
        Array.prototype.forEach.call(headings, function (heading) {
          const id = heading.id
            ? heading.id
            : heading.textContent
                .trim()
                .toLowerCase()
                .split(' ')
                .join('-')
                .replace(/[!@#$%^&*():]/gi, '')
                .replace(/\//gi, '-')
                .replace(/[\r\n]+/gi, '-') // 替换换行符
                .replaceAll("'", '-')
                .replaceAll('.', '-')
                .replaceAll('[', '-')
                .replaceAll(']', '-')
                .replaceAll(',', '-')
                .replaceAll('，', '-');
          // console.log(';;id, ', id);
          headingMap[id] = !isNaN(headingMap[id]) ? ++headingMap[id] : 0;
          if (headingMap[id]) {
            heading.id = id + '-' + headingMap[id];
          } else {
            heading.id = id;
          }
        });
      }

      tocbot.destroy();
      tocbot.init({
        // Where to render the table of contents.
        tocSelector: '.mini-app-side-panel .customizer-body',
        // Where to grab the headings to build the table of contents.
        contentSelector: '.mini-app .ProseMirror',
        headingSelector:
          'h1 .heading-content, h2 .heading-content, h3 .heading-content',
        // For headings inside relative or absolute positioned containers within content.
        hasInnerContainers: true,
        // Main class to add to lists.
        listClass: 'toc-list',
        listItemClass: 'toc-list-item',
        // activeListItemClass: 'is-active-li',
        linkClass: 'toc-link',
        activeLinkClass: 'is-active-link',
        // Class that gets added when a list should be collapsed.
        isCollapsedClass: 'is-collapsed',
        // Smooth scrolling enabled.
        scrollSmooth: true,
        scrollSmoothDuration: 420,
        headingsOffset: 80,
        scrollSmoothOffset: -80,
        collapseDepth: 0,
        orderedList: false,
      });
    },
  );

  useEffect(() => {
    if (miniAppName !== logoText) {
      dispatch(setLogoText({ logoText: miniAppName }));
    }
  }, [dispatch, logoText, miniAppName, repoName]);

  // #region /folded handleTextEditorChange
  const handleTextEditorChange = React.useCallback(
    (editorVal) => {
      // setState(editorState);

      const editorTextContents = editorVal();
      // const editorTextContents = editorState.doc.textBetween(
      //   0,
      //   editorState.doc.nodeSize - 2,
      //   '\n\n',
      // );

      // console.log(';;cur-editor-text, ', editorTextContents);
      console.log(';;cur-editor-text ');

      // 保存到缓存editorItems
      // dispatch(
      //   saveEditorItem({
      //     relativePath: openingFileMetadata.relativePath,
      //     fileContentCache: editorTextContents,
      //     editorItems,
      //   }),
      // );

      /** 上传文件最新内容
       * todo debounce
       */
      const ajaxData = async () => {
        const resData: any = await submitFileContents({
          repoName,
          relativePath: requestPagePath,
          newContent: editorTextContents,
        });

        console.log(';;ajax-res-submitFileContents, ', resData);

        if (resData.code === -1) {
          console.log(';;/上传文件内容失败, ', resData.state);

          dispatch(
            setMsgOption({
              msgType: 'submitFileContents',
              msgContent: `上传文件内容失败: ${resData.state}`,
              // currentRequestPath,
            }),
          );
          dispatch(enableMsg());
        }

        if (resData.code === 0) {
          // 提交成功,删除编辑缓存
          // dispatch(
          //   deleteEditorItem({
          //     relativePath: openingFileMetadata.relativePath,
          //     editorItems,
          //   }),
          // );
          // todo 提交成功后更新文件大小和修改日期
          // dispatch({
          //   type: "submitFileSuccess",
          //   currentRequestPath,
          //   relativePath: props.relativePath,
          // });
        }
      };

      ajaxData();
    },
    [dispatch, repoName, requestPagePath],
  );
  // #endregion /folded handleTextEditorChange

  return (
    <Card style={{ boxShadow: 'none' }}>
      <CardBody className='px-5 mini-app'>
        <div className='d-flex justify-content-between'>
          <div></div>
          <div>{/* <Link to='/edit/page/markdown'>编辑</Link> */}</div>
        </div>
        <Editor
          value={pagesContentsCaches[requestPagePath] || ''}
          readOnly={true}
          // onChange={handleTextEditorChange}
        />
      </CardBody>
    </Card>
  );
}

export default DocPageView;
