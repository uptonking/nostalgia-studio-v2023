import { BaseEditor, Descendant, Editor, Element } from 'slate';

import { isDefined } from '../../utils';
import type {
  CollapsibleElement,
  NestableElement,
  SemanticNode,
} from './types';
import { crawlChildren } from './utils';
import { ELEMENT_TO_SEMANTIC_PATH } from './weakmaps';

// type CollapsibleElement = CollapsibleElement &

export interface DraggableCollapsibleEditor extends BaseEditor {
  children: Element[];
  compareLevels: (a: Element, b: Element) => number;
  /** default false */
  isCollapsibleElement: (element: Element) => boolean;
  /** default false */
  isNestableElement: (element: Element) => boolean;
  semanticChildren: SemanticNode[];
  getSemanticChildren: (children: Descendant[]) => SemanticNode[];
  hasSemanticChildren: (element: Element) => boolean;
}

export const DraggableCollapsibleEditor = {
  hasSemanticChildren(element: Element) {
    const editorElem = DraggableCollapsibleEditor.semanticNode(element);
    return editorElem.children.length > 0;
  },

  /**
   * compute list-info of all nodes from `children`
   */
  getSemanticChildren(
    editor: DraggableCollapsibleEditor,
    children: Descendant[],
    options: {
      setPath?: (element: Element, path: SemanticNode[]) => void;
    } = {},
  ) {
    const { setPath } = options;

    /**  */
    const tree: SemanticNode[] = [];
    /**  */
    const path: SemanticNode[] = [];
    let index = 0;

    /** depth-counters map */
    let depthCounters: Record<string, number> = {};

    // /iterate top-level elements, and compute their list-info
    for (const element of children) {
      if (!Element.isElement(element)) {
        continue;
      }

      const edgeIndex = path.findIndex(
        (p) => editor.compareLevels(p.element, element) !== -1,
      );
      if (edgeIndex !== -1) {
        // keep only current element parents, path updated to be [0, edgeIndex-1]
        path.splice(edgeIndex);
      }

      // calculate list index
      let listIndex = 0;
      if (DraggableCollapsibleEditor.isNestableElement(editor, element)) {
        // init counter
        if (depthCounters[element.depth] == null) {
          depthCounters[element.depth] = 0;
        }

        // reset all counters with larger depth
        for (const key of Object.keys(depthCounters)) {
          if (Number(key) > element.depth) {
            depthCounters[key] = 0;
          }
        }

        listIndex = depthCounters[element.depth];
        depthCounters[element.depth]++;
      } else {
        // reset depth counters because current list ends
        depthCounters = {}; // depth-counters map
      }

      // calculate hidden
      let hidden = false;
      const folded = [...path]
        .reverse()
        .find(
          (node) =>
            DraggableCollapsibleEditor.isCollapsibleElement(editor, node.element) &&
            node.element.folded,
        );
      if (folded) {
        const foldedCount = DraggableCollapsibleEditor.isCollapsibleElement(
          editor,
          folded.element,
        )
          ? folded.element.foldedCount ?? 0
          : 0;
        hidden = foldedCount >= index - folded.index;
      }

      // add current element to path
      path.push({
        element,
        children: [],
        index,
        listIndex,
        hidden,
        folded,
        descendants: [],
      });

      if (setPath) setPath(element, [...path]);

      const last = path[path.length - 1];
      const parent = path[path.length - 2];
      const children = parent ? parent.children : tree;
      if (parent) {
        path.slice(0, -1).forEach((x) => {
          x.descendants.push(last);
        });
      }

      children.push(last);

      index++;
    }

    return tree;
  },

  getDroppableIntervals(
    editor: DraggableCollapsibleEditor,
    semanticChildren: SemanticNode[],
    contentLength: number,
  ): [number, number][] {
    const intervals: [number, number][] = [];
    let lastIndex = 0;
    let skipCount = 0;

    crawlChildren(
      semanticChildren,
      ({ element, children, index, descendants }, context) => {
        if (skipCount > 0) {
          skipCount = skipCount - descendants.length - 1;
          context.skip();
          return;
        }

        if (
          DraggableCollapsibleEditor.isCollapsibleElement(editor, element) &&
          element.folded &&
          children.length
        ) {
          skipCount = element.foldedCount || 0;
        }

        if (index > 0) {
          // finish previous interval
          intervals.push([lastIndex, index - 1]);
        }

        lastIndex = index;
      },
    );

    // finish last interval
    intervals.push([lastIndex, Math.max(contentLength - 1, 0)]);

    return intervals;
  },

  semanticPath(element: Element): SemanticNode[] {
    const path = ELEMENT_TO_SEMANTIC_PATH.get(element);

    if (!path) {
      throw new Error(
        `Cannot resolve a semantic path from Slate element: ${JSON.stringify(
          element,
        )}`,
      );
    }

    return path;
  },

  semanticNode(element: Element): SemanticNode {
    const path = DraggableCollapsibleEditor.semanticPath(element);
    return path[path.length - 1];
  },

  semanticDescendants(element: Element): SemanticNode[] {
    const semanticNode = DraggableCollapsibleEditor.semanticNode(element);
    return semanticNode.descendants;
  },

  semanticParent(element: Element): SemanticNode | null {
    const path = DraggableCollapsibleEditor.semanticPath(element);
    return path.length > 1 ? path[path.length - 2] : null;
  },

  isHiddenById(element: Element, id: string | null): boolean {
    const path = DraggableCollapsibleEditor.semanticPath(element);

    const hidden = isDefined(id) && path.some((x) => x.element['id'] === id);

    return hidden;
  },

  isFoldingElementCurried(editor: DraggableCollapsibleEditor) {
    return (element: any): element is Element & CollapsibleElement =>
      DraggableCollapsibleEditor.isCollapsibleElement(editor, element);
  },

  isCollapsibleElement(
    editor: DraggableCollapsibleEditor,
    element: any,
  ): element is Element & CollapsibleElement {
    return editor.isCollapsibleElement(element);
  },

  isNestingElementCurried(editor: DraggableCollapsibleEditor) {
    return (element: any): element is Element & NestableElement =>
      DraggableCollapsibleEditor.isNestableElement(editor, element);
  },

  isNestableElement(
    editor: DraggableCollapsibleEditor,
    element: any,
  ): element is Element & NestableElement {
    return editor.isNestableElement(element);
  },
};
