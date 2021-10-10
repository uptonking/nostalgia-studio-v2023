import React, { useCallback, useRef, useState } from 'react';
import { useGlobalContext } from '../../../store';
import FileContainerHeadSearchUl from './FileContainerHeadSearchUl';
// import { useSelector } from 'react-redux';

function FileContainerHeadSearchItem() {
  const input = useRef<HTMLInputElement>();
  // let { data } = useSelector((state) => state);

  const {
    state: {
      repo: { data },
    },
    // dispatch,
  } = useGlobalContext();

  const [list, setList] = useState([]);

  const inputHandler = useCallback(
    (e) => {
      const value = e.target.value;
      if (value) {
        const lastList = (data as any).files.filter((it) =>
          it.shortPath.startsWith(value),
        );
        setList(lastList);
      } else {
        setList([]);
      }
    },
    [data],
  );

  return (
    <label className='fm-table-header-search inline-flex relative'>
      <input
        type='text'
        className='fm-table-header-search-input'
        placeholder='搜索你的文件'
        autoFocus
        onInput={inputHandler}
        ref={input}
      />
      <i className='fa fa-search fm-table-search-btn relative' />
      <FileContainerHeadSearchUl
        list={list}
        setList={setList}
        input={input.current}
      />
    </label>
  );
}

export default FileContainerHeadSearchItem;
