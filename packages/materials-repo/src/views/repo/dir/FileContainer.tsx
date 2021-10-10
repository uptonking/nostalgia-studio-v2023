import * as React from 'react';
import { useEffect, useRef } from 'react';

import { useGlobalContext } from '../../../store';
import { FileTable } from './table-view';
import MaterialItemMenu from '../item-menu/MaterialItemMenu';

import { FileContainerHead } from '../toolbar';

/** 常用的文件浏览器视图，包括文件操作工具条、右键菜单、文件列表 */
export function FileContainer() {
  const {
    state: {
      repo: { fileModelType, menuState },
    },
    dispatch,
  } = useGlobalContext();
  const listContainerRef = useRef<HTMLDivElement>();

  // console.log(';;menuState, ', menuState);

  // 阻止列表最外层的右键菜单
  useEffect(() => {
    // let currentItem = jquery(listContainerRef.current);
    // currentItem.on('contextmenu', () => false);

    function handleContextMenu(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    const el = listContainerRef.current;
    el.addEventListener('contextmenu', handleContextMenu);

    return () => {
      // currentItem.off('contextmenu')
      el.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className='fm-table-container relative ' ref={listContainerRef}>
      <FileContainerHead />
      {menuState && <MaterialItemMenu />}
      {/* {fileModelType === 'table' ? <FileTable /> : <FileBlock />} */}
      <FileTable />
    </div>
  );
}

export default FileContainer;
