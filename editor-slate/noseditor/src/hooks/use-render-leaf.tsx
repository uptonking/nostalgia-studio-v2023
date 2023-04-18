import React, { useCallback } from 'react';

import { Editor } from 'slate';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';

import { NosPlugin } from '../plugins/types';

export const useRenderLeaf = (editor: Editor, plugins: NosPlugin[]) => {
  const renderers = plugins
    .filter((x) => x.renderLeaf)
    .map((x) => x.renderLeaf!);

  return useCallback(
    (props: RenderLeafProps) => renderLeafContent(props, renderers),
    [],
  );
};

export const renderLeafContent = (
  props: RenderLeafProps,
  renderers: ((props: RenderLeafProps) => JSX.Element | null)[],
) => {
  for (const render of renderers) {
    const rendered = render(props);

    if (rendered) {
      return rendered;
    }
  }

  return (
    <DefaultLeaf
      text={props.text}
      leaf={props.leaf}
      attributes={props.attributes}
    >
      {props.children}
    </DefaultLeaf>
  );
};
