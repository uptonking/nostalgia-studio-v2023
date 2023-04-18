import React, { useCallback } from 'react';

import { Editor } from 'slate';
import { DefaultElement } from 'slate-react';

import { DragOverlayWrapper } from '../components';
import {
  DraggableCollapsibleEditor,
} from '../plugins/draggable-collapsible-feature/collapsible-editor';
import { ElementProps, NosPlugin } from '../plugins/types';

export const useDragOverlayRenderElement = (
  editor: Editor,
  plugins: NosPlugin[],
) => {
  const renderers = plugins
    .filter((x) => x.renderElement)
    .map((x) => x.renderElement!);

  const renderElement = useCallback(
    (props) => {
      if (DraggableCollapsibleEditor.isNestableElement(editor, props.element)) {
        const { attributes, element } = props;

        return (
          <DragOverlayWrapper attributes={attributes} element={element}>
            {renderElementContent(props, renderers)}
          </DragOverlayWrapper>
        );
      }

      return renderElementContent(props, renderers);
    },
    [editor],
  );

  return renderElement;
};

export default useDragOverlayRenderElement;

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
