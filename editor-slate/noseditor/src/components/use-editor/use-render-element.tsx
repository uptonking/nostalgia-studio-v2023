import React, { useCallback } from 'react';

import { Editor } from 'slate';
import { DefaultElement, ReactEditor, RenderElementProps } from 'slate-react';

import { ElementProps, NosPlugin } from '../../plugins/types';
import { Wrapper } from '../../plugins/wrapper';

/**
 * may wrap element in dragSort container
 */
export const useRenderElement = (editor: Editor, plugins: NosPlugin[]) => {
  const renderers = plugins
    .filter((x) => x.renderElement)
    .map((x) => x.renderElement!);

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      const { attributes, children, element } = props;

      const path = ReactEditor.findPath(editor, element);

      if (path.length === 1) {
        // /only wrap top level element
        return (
          <Wrapper attributes={attributes} element={element}>
            {renderElementContent(
              {
                element,
                children,
              },
              renderers,
            )}
          </Wrapper>
        );
      }

      return renderElementContent(
        {
          attributes,
          element,
          children,
        },
        renderers,
      );
    },
    [editor],
  );

  return renderElement;
};

export const renderElementContent = (
  props: ElementProps,
  renderers: ((props: ElementProps) => JSX.Element | null)[],
) => {
  for (const render of renderers) {
    const rendered = render(props);

    if (rendered) {
      return rendered;
    }
  }

  return (
    <DefaultElement element={props.element} attributes={props.attributes!}>
      {props.children}
    </DefaultElement>
  );
};
