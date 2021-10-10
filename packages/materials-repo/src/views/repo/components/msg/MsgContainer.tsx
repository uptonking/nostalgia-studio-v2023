import './index.scss';

import * as React from 'react';
import { useCallback, useRef } from 'react';

import { useGlobalContext } from '../../../../store';
import { disableMsg } from '../../../../store/repo/actions';

/** 类似Modal的提示信息组件 */
export function MsgContainer(props) {
  const {
    state: {
      repo: { msgContent },
    },
    dispatch,
  } = useGlobalContext();
  const msgMainContents = props.msgContent || msgContent;

  const msgContainerRef = useRef<HTMLDivElement>();
  // let history = useHistory();
  // let dispatch = useDispatch();
  // let { msgContent, msgState, preRequestPath } = useSelector((state) => state);

  // useEffect(() => {
  //   if (msgState === "padding") {
  //     let item = jquery(msgContainerRef.current);
  //     promiseNext(0, () => {
  //       item.removeClass("animate__zoomIn").addClass("animate__zoomOut");
  //     }).then(() =>
  //       promiseNext(400, () => {
  //         dispatch({ type: "disableMsg" });
  //         history.push(preRequestPath);
  //       })
  //     );
  //   }
  // }, [msgState, history, dispatch, preRequestPath]);

  const closeMsgHandler = useCallback(() => {
    // dispatch({ type: 'msgStatePadding' });
    // console.log(';;close msg modal');
    dispatch(disableMsg());
  }, [dispatch]);

  return (
    <div className='msg-container flex-center' ref={msgContainerRef}>
      <div className='flex-center flex-column msg-container-body relative'>
        {/* <div> */}
        <span className='msg-container-content'>{msgMainContents}</span>
        {/* </div> */}
        <div className='my-3'>
          <button className='msg-container-btn' onClick={closeMsgHandler}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default MsgContainer;
