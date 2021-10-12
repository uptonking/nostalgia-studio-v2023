import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useKeyboardJs from 'react-use/lib/useKeyboardJs';
import Editor from 'rich-markdown-editor';

import { submitFileContents } from '../../../services/repoService';
import { useGlobalContext } from '../../../store';
import {
  deleteEditorItem,
  enableMsg,
  saveEditorItem,
  setMsgOption,
  setRepoViewType,
} from '../../../store/repo/actions';

export function MarkdownEditor() {
  const {
    state: {
      repo: {
        repoName,
        repoViewType,
        openingFileType,
        openingFilename,
        editorItems,
        openingFileMetadata,
        openingFileContentCache,
        currentRequestPath,
      },
    },
    dispatch,
  } = useGlobalContext();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isNavBackPreseed] = useKeyboardJs([
    'alt + left',
    'alt > left',
    'left > alt',
  ]);
  const contentReadOnly = true;
  console.log(';;isNavBackPreseed, ', isNavBackPreseed);
  if (contentReadOnly && pathname.includes('/repo') && isNavBackPreseed) {
    dispatch(setRepoViewType({ repoViewType: 'file-manager' }));
  }

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
      dispatch(
        saveEditorItem({
          relativePath: openingFileMetadata.relativePath,
          fileContentCache: editorTextContents,
          editorItems,
        }),
      );

      /** 上传文件最新内容
       * todo debounce
       */
      const ajaxData = async () => {
        const resData: any = await submitFileContents({
          repoName,
          relativePath: openingFileMetadata.relativePath,
          newContent: editorTextContents,
        });

        console.log(';;ajax-res-submitFileContents, ', resData);

        if (resData.code === -1) {
          console.log(';;/上传文件内容失败, ', resData.state);

          dispatch(
            setMsgOption({
              msgType: 'submitFileContents',
              msgContent: `上传文件内容失败: ${resData.state}`,
              currentRequestPath,
            }),
          );
          dispatch(enableMsg());
        }

        if (resData.code === 0) {
          // 提交成功,删除编辑缓存
          dispatch(
            deleteEditorItem({
              relativePath: openingFileMetadata.relativePath,
              editorItems,
            }),
          );

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
    [
      currentRequestPath,
      dispatch,
      editorItems,
      openingFileMetadata.relativePath,
      repoName,
    ],
  );

  return (
    <div
      style={{
        padding: `28px`,
        border: `1px solid silver`,
        // minWidth: `100%`,
        minWidth: `60vw`,
      }}
    >
      <div className='d-flex justify-content-between'>
        <div>
          <h4>{openingFilename}</h4>
        </div>
        <div>{/* <Link to='/edit/markdown'>编辑</Link> */}</div>
      </div>
      {/* <Editor /> */}
      <Editor
        defaultValue={openingFileContentCache || ''}
        onChange={handleTextEditorChange}
        // readOnly={true}
      />
    </div>
  );
}

export default MarkdownEditor;
