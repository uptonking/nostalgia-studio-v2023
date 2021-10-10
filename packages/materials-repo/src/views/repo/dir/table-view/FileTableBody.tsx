import React from 'react';
import FileTableFileItem from './FileTableFileItem';
import FileTableDirItem from './FileTableDirItem';
import * as Allfilter from '../../../../utils/list-filter';
import { useGlobalContext } from '../../../../store';

/** 文件夹列表和文件列表 */
function FileTableBody() {
  const {
    state: {
      repo: { data, filterName },
    },
    dispatch,
  } = useGlobalContext();
  console.log(';;FileTableBody-data, ', data.files);

  return (
    <tbody>
      {data.files.length === 0 ? (
        <tr>
          <td>
            <p className='text-muted pt-2 display-6'>空文件夹</p>
          </td>
        </tr>
      ) : (
        data.files.map((item) => {
          return item.fileType === 'file' ? (
            Allfilter[filterName](item.shortPath) && (
              <FileTableFileItem key={item.id} {...item} />
            )
          ) : (
            <FileTableDirItem key={item.id} {...item} />
          );
        })
      )}
    </tbody>
  );
}

export default FileTableBody;
