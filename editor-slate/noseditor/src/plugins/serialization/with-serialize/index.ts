import { Editor } from 'slate';

import { getClipboardPlainText } from './get-clipboard-plain-text';
import { patchCopiedClipboardHtml } from './patch-copied-clipboard-html';
import { removeSkippedElements } from './remove-skipped-elements';

/**
 * create temporary hidden div for clipboardNode
 */
const getClipboardDataHtmlNode = (data: any) => {
  const clipboardNode = document.createElement('div');
  clipboardNode.innerHTML = data.getData('text/html');
  clipboardNode.setAttribute('hidden', 'true');
  document.body.appendChild(clipboardNode);
  return clipboardNode;
};

export const withSerialize = (editor: Editor) => {
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
