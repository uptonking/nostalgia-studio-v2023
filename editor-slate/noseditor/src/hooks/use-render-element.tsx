import React, { useCallback } from 'react';

import { Editor } from 'slate';
import {
  DefaultElement,
  ReactEditor,
  type RenderElementProps,
} from 'slate-react';

import { DraggableContainer } from '../components';
import { type ElementProps, type NosPlugin } from '../plugins/types';

/**
 * may wrap element in dragSort container
 */
export const useRenderElement = (editor: ReactEditor, plugins: NosPlugin[]) => {
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
          <DraggableContainer attributes={attributes} element={element}>
            {renderElementContent(
              {
                element,
                children,
              },
              renderers,
            )}
          </DraggableContainer>
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
