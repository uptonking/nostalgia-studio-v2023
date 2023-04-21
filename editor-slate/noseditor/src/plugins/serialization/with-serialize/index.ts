import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';

import { getClipboardPlainText } from './get-clipboard-plain-text';
import { patchCopiedClipboardHtml } from './patch-copied-clipboard-html';
import { removeSkippedElements } from './remove-skipped-elements';

/**
 * create temporary hidden div for clipboardNode
 */
const getClipboardDataHtmlNode = (data: {
  getData: (arg0: string) => string;
}) => {
  const clipboardNode = document.createElement('div');
  clipboardNode.innerHTML = data.getData('text/html');
  clipboardNode.setAttribute('hidden', 'true');
  document.body.appendChild(clipboardNode);
  return clipboardNode;
};

/**
 * serialize editor-model to text/plain and text/html
 */
export const withSerialize = (editor: ReactEditor) => {
  const { setFragmentData } = editor;

  editor.setFragmentData = (data) => {
    setFragmentData(data);

    const clipboardNode = getClipboardDataHtmlNode(data);
    removeSkippedElements(clipboardNode);

    const plainText = getClipboardPlainText(clipboardNode);
    data.setData('text/plain', plainText);

    patchCopiedClipboardHtml(clipboardNode);
    data.setData('text/html', clipboardNode.innerHTML);

    document.body.removeChild(clipboardNode);
  };

  return editor;
};
