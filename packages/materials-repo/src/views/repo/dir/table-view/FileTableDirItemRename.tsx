import React, { useCallback, useRef } from 'react';
import { renameFile } from '../../../../services/repoService';
import { useGlobalContext } from '../../../../store';
import {
  renameItemSuccess,
  renameCompleted,
  enableMsg,
  setMsgOption,
} from '../../../../store/repo/actions';

// 重命名文件夹
function RenameInput(props) {
  const renameInputRef = useRef<HTMLInputElement>();

  const {
    state: {
      repo: { repoName, data },
    },
    dispatch,
  } = useGlobalContext();

  const handleRenameInputChange = useCallback(
    (e) => {
      const value = e.target.value;

      const ajaxData = async () => {
        const inputParentEl = renameInputRef.current.parentElement;

        // ajax发送新文件名到服务器
        const resData: any = await renameFile({
          repoName,
          relativePath: data.relativePath,
          oldName: props.shortPath,
          newName: value,
        });
        console.log(';;ajax-res-renameDir, ', resData.state);

        if (resData.code === 0) {
          dispatch(
            renameItemSuccess({
              repoData: data,
              id: props.id,
              oldName: props.shortPath,
              newName: value.replace(/\s+/g, ''),
            }),
          );
        }

        if (resData.code === -1) {
          console.log(';; /重命名失败, ', resData);

          dispatch(
            setMsgOption({
              msgType: 'renameDir',
              msgContent: `重命名失败: ${props.shortPath} > ${value}`,
            }),
          );
          dispatch(enableMsg());
        }

        dispatch(renameCompleted());
      };

      if (value !== props.shortPath) {
        ajaxData();
      } else {
        // dispatch({ type: "renameComplated" });
        dispatch(renameCompleted());
      }
    },
    [props.shortPath, props.id, repoName, data, dispatch],
  );

  return (
    <input
      ref={renameInputRef}
      className='fm-table-rename'
      defaultValue={props.shortPath}
      type='text'
      autoFocus
      onBlur={handleRenameInputChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleRenameInputChange(e);
        }
      }}
    />
  );
}

export default RenameInput;
