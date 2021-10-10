import React from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalContext } from '../../../store';
import MarkdownEditor from './MarkdownEditor';
import ViewNotSupported from './ViewNotSupported';
import { TextEditor } from './TextEditor';
// import { MinProseMirrorApp as TextEditor } from './TextEditor';

function FileViewer() {
  // let { type } = useParams();

  const {
    state: {
      repo: { repoName, repoViewType, openingFileType, openingFilename },
    },
    dispatch,
  } = useGlobalContext();

  if (openingFileType === 'markdown') {
    return <MarkdownEditor />;
  }
  if (openingFileType === 'text') {
    return <TextEditor />;
  }

  return <ViewNotSupported />;
}

export default FileViewer;
