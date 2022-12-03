import React from 'react';

import { useGlobalContext } from '../../../store';

// 编辑文件
function FileMenuEditorItem() {
  const {
    state: {
      repo: { repoName, menuTarget },
    },
    dispatch,
  } = useGlobalContext();

  // const history = useHistory();
  // let dispatch = useDispatch();
  // let { menuTarget } = useSelector((state) => state);

  return (
    <li
      className='fm-context-item overflow relative'
      onClick={() => {
        // history.push(menuTarget);
        dispatch({ type: 'menuHide' });
      }}
    >
      <i className='fa fa-edit' />
      <span>编辑</span>
    </li>
  );
}

export default FileMenuEditorItem;
