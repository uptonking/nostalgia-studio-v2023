import React, { useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';

import { useGlobalContext } from '../../../store';
import { hideListItemActionsMenu } from '../../../store/repo/actions';
import DownloadFileMenuItem from './DownloadFileMenuItem';
import FileMenuCopyItem from './FileMenuCopyItem';
import FileMenuDeleteItem from './FileMenuDeleteItem';
import FileMenuEditorItem from './FileMenuEditorItem';
import FileMenuMoveItem from './FileMenuMoveItem';
import FileMenuRenameItem from './FileMenuRenameItem';
import OpenAsMiniAppMenuItem from './OpenAsMiniAppMenuItem';

/** 文件或文件夹的右键菜单 */
function MaterialItemMenu() {
  const {
    state: {
      repo: { repoName, menuPosition, menuState, menuType },
    },
    dispatch,
  } = useGlobalContext();

  const ctxMenuRef = useRef<HTMLDivElement>();

  useClickAway<MouseEvent>(ctxMenuRef, () => {
    console.log('ctx-menu OUTSIDE CLICKED');
    dispatch(hideListItemActionsMenu());
  });

  // 菜单的显示与隐藏
  useEffect(() => {
    const el = ctxMenuRef.current;

    if (menuState === true) {
      el.style.setProperty('left', menuPosition.x + 'px');

      const elHeight = parseFloat(
        getComputedStyle(el, null).height.replace('px', ''),
      );

      const elTop =
        elHeight + menuPosition.y + 10 > document.body.offsetHeight
          ? document.body.offsetHeight - elHeight - 10
          : menuPosition.y;

      el.style.setProperty('top', elTop + 'px');
    } else {
      dispatch(hideListItemActionsMenu());
    }
  }, [menuPosition, menuState, dispatch]);

  return (
    <div className='fm-contextmenu fixed' ref={ctxMenuRef}>
      <ul className='fm-context-ul p-0'>
        {menuType === 'file' && <DownloadFileMenuItem />}
        {menuType === 'file' && <FileMenuEditorItem />}
        {/* {menuType === 'file' && <FileMenuCopyItem />} */}
        {menuType === 'dir' && <OpenAsMiniAppMenuItem />}
        {menuType !== 'body' && <FileMenuRenameItem />}
        {menuType !== 'body' && <FileMenuDeleteItem />}
        {/* {menuType !== 'body' && <FileMenuMoveItem />} */}
      </ul>
    </div>
  );
}

export default MaterialItemMenu;
