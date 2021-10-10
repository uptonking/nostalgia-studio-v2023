import 'prosemirror-view/style/prosemirror.css';

import './text-editor.scss';

import { Command, baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { DOMParser, DOMSerializer, MarkType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Transaction } from 'prosemirror-state';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useKeyboardJs from 'react-use/lib/useKeyboardJs';

import { useGlobalContext } from '../../../store';
import { ProseMirrorEditor, useProseMirror } from './use-prosemirror';
import { submitFileContents } from '../../../services/repoService';
import {
  setMsgOption,
  enableMsg,
  deleteEditorItem,
  saveEditorItem,
  setRepoViewType,
} from '../../../store/repo/actions';

import throttle from 'lodash/throttle';

const toggleBold = toggleMarkCommand(schema.marks.strong);
const toggleItalic = toggleMarkCommand(schema.marks.em);

const getEditorConfig = (
  initialText: string = ' ',
): Parameters<typeof useProseMirror>[0] => ({
  schema,
  doc: schema.node('doc', null, [
    schema.node('paragraph', null, [schema.text(initialText)]),
  ]),
  plugins: [
    history(),
    keymap({
      ...baseKeymap,
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
      'Mod-b': toggleBold,
      'Mod-i': toggleItalic,
    }),
  ],
});

/**
 * 基于prosemirror的只读编辑器。
 */
export function TextEditor(props) {
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

  console.log(
    ';;pps4 TextEditor, ',
    openingFileMetadata,
    // openingFileContentCache,
  );

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isNavBackPreseed] = useKeyboardJs([
    'alt + left',
    'alt > left',
    'left > alt',
  ]);

  const contentReadOnly = true;

  // useEffect(() => {
  // const pathArr = removeTrailingSlashIfExists(pathname).split('/');
  console.log(';;isNavBackPreseed, ', isNavBackPreseed);

  if (contentReadOnly && pathname.includes('/repo') && isNavBackPreseed) {
    dispatch(setRepoViewType({ repoViewType: 'file-manager' }));
  }
  // }, [contentReadOnly, dispatch, isNavBackPreseed, pathname]);

  // 若初始文件为空字符串，默认就添加一个空格
  const editorConfig = getEditorConfig(openingFileContentCache || ' ');
  const [state, setState] = useProseMirror(editorConfig);
  // console.log(';;text-editor-Config, ', editorConfig);
  // console.log(';;text-editor-initial, ', state.doc.toString());

  // useEffect(() => {
  // }, []);

  const handleTextEditorChange = useCallback(
    (editorState: EditorState) => {
      setState(editorState);

      const editorTextContents = editorState.doc.textBetween(
        0,
        editorState.doc.nodeSize - 2,
        '\n\n',
      );

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

      // const throttledAjax = throttle(ajaxData, 2500);
      // throttledAjax();

      ajaxData();
    },
    [
      currentRequestPath,
      dispatch,
      editorItems,
      openingFileMetadata.relativePath,
      repoName,
      setState,
    ],
  );

  /**
   * todo 节流更新ajax失败
   */
  const throttledHandleTextEditorChange = throttle(
    handleTextEditorChange,
    2500,
  );

  // const ajaxUpdateFileContents =

  return (
    <div
      style={{
        minWidth: `60vw`,
        // width: `100%`,
      }}
    >
      <div className='d-flex justify-content-between'>
        <div>
          <h4>{openingFilename}</h4>
        </div>
        <div>
          <Link to='/edit/text'>编辑</Link>
        </div>
      </div>
      <div className='Menu'>
        <Button
          className='bold'
          isActive={isBold(state)}
          onClick={() => toggleBold(state, (tr) => setState(state.apply(tr)))}
        >
          B
        </Button>
        <Button
          className='italic'
          isActive={isItalic(state)}
          onClick={() => toggleItalic(state, (tr) => setState(state.apply(tr)))}
        >
          I
        </Button>
      </div>
      <div className='ProseMirrorContainer'>
        <ProseMirrorEditor
          className='ProseMirror'
          state={state}
          onChange={throttledHandleTextEditorChange}
          // onChange={setState}
          // editable={() => false}
        />
      </div>
    </div>
  );
}

function toggleMarkCommand(mark: MarkType): Command {
  return (
    state: EditorState,
    dispatch: ((tr: Transaction) => void) | undefined,
  ) => toggleMark(mark)(state, dispatch);
}

function isBold(state: EditorState): boolean {
  return isMarkActive(state, schema.marks.strong);
}

function isItalic(state: EditorState): boolean {
  return isMarkActive(state, schema.marks.em);
}

// https://github.com/ProseMirror/prosemirror-example-setup/blob/afbc42a68803a57af3f29dd93c3c522c30ea3ed6/src/menu.js#L57-L61
function isMarkActive(state: EditorState, mark: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  return empty
    ? !!mark.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, mark);
}

function Button(props: {
  children: React.ReactNode;
  isActive: boolean;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      className={props.className}
      style={{
        backgroundColor: props.isActive ? '#efeeef' : '#fff',
        color: props.isActive ? 'blue' : 'black',
      }}
      onMouseDown={handleMouseDown}
    >
      {props.children}
    </button>
  );

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault(); // Prevent editor losing focus
    props.onClick();
  }
}

export function MinProseMirrorApp() {
  // const editorConfig = getEditorConfig(initialTextVal);
  const editorConfig = getEditorConfig();
  console.log(';;text-editor-Config, ', editorConfig);
  const [state, setState] = useProseMirror(editorConfig);
  // const [state, setState] = useProseMirror({ schema });

  return (
    <div style={{ padding: `28px`, border: `1px solid silver` }}>
      <ProseMirrorEditor
        state={state}
        onChange={setState}
        // editable={false}
      />
    </div>
  );
}

export default TextEditor;
