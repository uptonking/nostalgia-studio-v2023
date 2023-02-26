import React from 'react';

import { Ancestor, Descendant, Editor, Element, Range } from 'slate';

import { ReactEditor } from '..';
import {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from '../components/editable';
import ElementComponent from '../components/element';
import TextComponent from '../components/text';
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps';
import { SelectedContext } from './use-selected';
import { useSlateStatic } from './use-slate-static';

/**
 * Children.
 * - 广度优先遍历
 */
export const useChildren = (props: {
  decorations: Range[];
  node: Ancestor;
  renderElement?: (props: RenderElementProps) => JSX.Element;
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element;
  renderLeaf?: (props: RenderLeafProps) => JSX.Element;
  selection: Range | null;
}) => {
  const {
    decorations,
    node,
    renderElement,
    renderPlaceholder,
    renderLeaf,
    selection,
  } = props;
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, node);
  /** 所有model元素对应的react元素，广度优先遍历 */
  const children = [];
  const isLeafBlock =
    Element.isElement(node) &&
    !editor.isInline(node) &&
    Editor.hasInlines(editor, node);

  for (let i = 0; i < node.children.length; i++) {
    const p = path.concat(i);
    const n = node.children[i] as Descendant;
    const key = ReactEditor.findKey(editor, n);
    const range = Editor.range(editor, p);
    const sel = selection && Range.intersection(range, selection);

    const ds = decorations.reduce<Range[]>((acc, dec) => {
      const intersection = Range.intersection(dec, range);
      if (intersection) acc.push(intersection);
      return acc;
    }, []);

    if (Element.isElement(n)) {
      children.push(
        <SelectedContext.Provider key={`provider-${key.id}`} value={!!sel}>
          <ElementComponent
            decorations={ds}
            element={n}
            key={key.id}
            renderElement={renderElement}
            renderPlaceholder={renderPlaceholder}
            renderLeaf={renderLeaf}
            selection={sel}
          />
        </SelectedContext.Provider>,
      );
    } else {
      children.push(
        <TextComponent
          decorations={ds}
          key={key.id}
          isLast={isLeafBlock && i === node.children.length - 1}
          parent={node}
          renderPlaceholder={renderPlaceholder}
          renderLeaf={renderLeaf}
          text={n}
        />,
      );
    }

    NODE_TO_INDEX.set(n, i);
    NODE_TO_PARENT.set(n, node);
  }

  return children;
};

export default useChildren;
