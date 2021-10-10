import React, { useCallback } from 'react';
import { useGlobalContext } from '../../../store';
import FileContainerHeadSearchItem from './FileContainerHeadSearchItem';

// import { useDispatch, useSelector } from "react-redux";

/** 切换文件显示模式的按钮，列表或缩略图 */
function FileContainerHeadRightBtn() {
  // const dispatch = useDispatch();
  // const fileModelType = useSelector((state) => state.fileModelType);
  const {
    state: {
      repo: { fileModelType },
    },
    dispatch,
  } = useGlobalContext();

  const clickHandler = useCallback(
    (e) => {
      dispatch({
        type: 'changeFileModelType',
        fileModelType: e.target.dataset.name,
      });
    },
    [dispatch],
  );

  return (
    <div className='fm-table-header-rightTools'>
      <FileContainerHeadSearchItem />
      <span
        className={
          fileModelType === 'table' ? 'inline-flex check' : 'inline-flex'
        }
        onClick={clickHandler}
      >
        <i
          data-name='table'
          className='fa fa-list-ul fm-table-header-sort inline-flex'
        />
      </span>
      <span
        className={
          fileModelType === 'block' ? 'inline-flex check' : 'inline-flex'
        }
        onClick={clickHandler}
      >
        <i
          data-name='block'
          className='fa fa-th-large fm-table-header-big inline-flex'
        />
      </span>
    </div>
  );
}

export default FileContainerHeadRightBtn;
