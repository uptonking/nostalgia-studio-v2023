import { indexBy } from 'ramda';
import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';

import { deserializePlugins } from './deserialize-plugins';
import { deserializeHtml } from './html-to-editor-model';
import { patchPastedClipboardHtml } from './patch-pasted-clipboard-html';

/**
 * deserialize html to editor-model
 */
export const withDeserialize = (editor: ReactEditor) => {
  const { insertFragmentData } = editor;

  editor.insertFragmentData = (data) => {
    const result = insertFragmentData(data);

    if (result) {
      return true;
    }

    let html = data.getData('text/html');
    if (!html) {
      return false;
    }

    // replace whitespaces 160 to 32, they could be at links edges
    html = html.replace(new RegExp(String.fromCharCode(160), 'g'), ' ');

    const document = new DOMParser().parseFromString(html, 'text/html');

    patchPastedClipboardHtml(document.body);

    const htmlFragment = deserializeHtml(
      {
        ...editor,
        plugins: deserializePlugins,
        pluginsByKey: indexBy((x) => x.key, deserializePlugins),
      } as Editor,
      { element: document.body },
    );

    if (htmlFragment) {
      editor.insertFragment(htmlFragment);
      return true;
    }

    return false;
  };

  return editor;
};
