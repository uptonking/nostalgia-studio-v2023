import React from 'react';
import FileBlockBody from './FileBlockBody';
// import { useSelector } from 'react-redux';

function FileBlock() {
  let { isLoaded } = useSelector((state) => state);
  return (
    <div className='fm-table-big son-inline-block relative animate__animated animate__fadeIn animate__faster'>
      {isLoaded && <FileBlockBody />}
    </div>
  );
}

export default FileBlock;
