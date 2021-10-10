import React, { useCallback } from 'react';
import { Label, Input } from 'reactstrap';
import { useGlobalContext } from '../../../../store';
// import { useDispatch } from "react-redux";

// 文件选中
function FileTableFileCheck(props) {
  // let dispatch = useDispatch();

  const {
    // state: {
    //   repo: { data, filterName },
    // },
    dispatch,
  } = useGlobalContext();

  const checkHandler = useCallback(() => {
    dispatch({ type: 'changeFileItemCheck', id: props.id });
  }, [props, dispatch]);

  return (
    <Label check={!!props.checked} className='pr-2'>
      <Input
        type='checkbox'
        // onClick={checkHandler}
      />
    </Label>
  );
}

export default FileTableFileCheck;
