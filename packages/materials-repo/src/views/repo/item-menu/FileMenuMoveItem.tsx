import React, { useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../../../store';
// import { useDispatch, useSelector } from "react-redux";
// import { moveFile } from "../../tools/requestData";

// 移动文件到回收站文件夹，而不是彻底删除
function FileMenuMoveItem() {
  const {
    state: {
      repo: {
        repoName,
        msgState,
        msgType,
        data,
        menuShortName,
        menuRelativePath,
      },
    },
    dispatch,
  } = useGlobalContext();

  const linkRef = useRef<HTMLAnchorElement>();
  const location = useLocation();
  // const dispatch = useDispatch();
  // let {
  //   msgState,
  //   msgType,
  //   data,
  //   menuShortName,
  //   menuRelativePath,
  // } = useSelector((state) => state);

  const removeHandler = useCallback(() => {
    // moveFile(menuShortName, data.relativePath).then((res) => {
    //   if (res.code === 0) {
    //     // 移除成功
    //     dispatch({ type: "menuPadding" });
    //     // 文件移除
    //     dispatch({
    //       type: "removeItem",
    //       shortPath: menuShortName,
    //     });
    //     // 编辑内容删除
    //     dispatch({
    //       type: "deleteEditorItem",
    //       relativePath: menuRelativePath,
    //     });
    //     // 刷新id
    //     dispatch({ type: "refreshId" });
    //     // 菜单消失
    //   } else {
    //     // 删除失败
    //     dispatch({ type: "menuHide" });
    //     dispatch({
    //       type: "setMsgOption",
    //       msgType: "moveFile",
    //       msgContent: "移除文件出错",
    //     });
    //     dispatch({ type: "enableMsg" });
    //   }
    // });
  }, [data, menuShortName, dispatch, menuRelativePath]);

  // useEffect(() => {
  //   if (msgState && msgType === 'moveFile' && linkRef.current) {
  //     linkRef.current.click();
  //   }
  // }, [msgState, msgType]);

  return (
    <>
      {
        // msgState && (
        //   <Link
        //     ref={linkRef}
        //     className='none'
        //     to={{ pathname: '/msg' }}
        //     // to={{ pathname: "/msg", state: { background: location } }}
        //   />
        // )
      }
      <li className='fm-context-item overflow relative' onClick={removeHandler}>
        <i className='fa fa-trash-o' />
        <span>移除</span>
      </li>
    </>
  );
}

export default FileMenuMoveItem;
