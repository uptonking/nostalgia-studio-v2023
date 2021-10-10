import React from 'react';
import FileBlockFileItem from './FileBlockFileItem';
import FileBlockDirItem from './FileBlockDirItem';
import * as Allfilter from '../../../../utils/list-filter';

// import { useSelector } from 'react-redux';

function FileBlockBody() {
  let { filterName, data } = useSelector((state) => state);
  return (
    <>
      {data.files.map((it) => {
        return it.fileType === 'file' ? (
          Allfilter[filterName](it.shortPath) && (
            <FileBlockFileItem key={it.id} {...it} />
          )
        ) : (
          <FileBlockDirItem key={it.id} {...it} />
        );
      })}
    </>
  );
}

export default FileBlockBody;
