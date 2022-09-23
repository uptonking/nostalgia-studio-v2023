import { ResolvedPos } from 'prosemirror-model';
import { NodeSelection, Selection, TextSelection } from 'prosemirror-state';

import * as browser from './browser';
import {
  domIndex,
  isEquivalentPosition,
  isOnEdge,
  selectionCollapsed,
} from './dom';
import { EditorView } from './index';
import { NodeViewDesc } from './viewdesc';

/**
 * 根据浏览器默认选区对象，计算并返回prosemirror对应的Selection对象
 */
export function selectionFromDOM(
  view: EditorView,
  origin: string | null = null,
) {
  const domSel = view.domSelection(); // 获取浏览器默认选区对象
  // console.trace(
  //   ';; selFromDOM-浏览器选区 ',
  //   domSel.anchorOffset,
  //   domSel.focusOffset,
  //   domSel,
  // );

  const doc = view.state.doc;
  if (!domSel.focusNode) return null;
  let nearestDesc = view.docView.nearestDesc(domSel.focusNode);
  const inWidget = nearestDesc && nearestDesc.size == 0;
  const head = view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset, 1);
  if (head < 0) return null;
  const $head = doc.resolve(head);
  let $anchor: ResolvedPos;
  let selection: NodeSelection | Selection;
  if (selectionCollapsed(domSel)) {
    $anchor = $head;
    while (nearestDesc && !nearestDesc.node) {
      nearestDesc = nearestDesc.parent;
    }
    const nearestDescNode = (nearestDesc as NodeViewDesc).node;
    if (
      nearestDesc &&
      nearestDescNode.isAtom &&
      NodeSelection.isSelectable(nearestDescNode) &&
      nearestDesc.parent &&
      !(
        nearestDescNode.isInline &&
        isOnEdge(domSel.focusNode, domSel.focusOffset, nearestDesc.dom)
      )
    ) {
      // /这里只处理 NodeSelection
      const pos = nearestDesc.posBefore;
      selection = new NodeSelection(head === pos ? $head : doc.resolve(pos));
    }
  } else {
    // /when selection is not collapsed
    const anchor = view.docView.posFromDOM(
      domSel.anchorNode!,
      domSel.anchorOffset,
      1,
    );
    if (anchor < 0) return null;
    $anchor = doc.resolve(anchor);
  }

  if (!selection) {
    // 对于单光标，bias是1
    const bias =
      origin === 'pointer' ||
      (view.state.selection.head < $head.pos && !inWidget)
        ? 1
        : -1;
    // 这里会创建TextSelection
    selection = selectionBetween(view, $anchor, $head, bias);
  }

  return selection;
}

function editorOwnsSelection(view: EditorView) {
  return view.editable
    ? view.hasFocus()
    : hasSelection(view) &&
        document.activeElement &&
        document.activeElement.contains(view.dom);
}

/**
 * editorSelection应用到dom
 */
export function selectionToDOM(view: EditorView, force = false) {
  const sel = view.state.selection;
  // console.trace('selToDOM-编辑器选区', sel.from, sel.to, sel);

  syncNodeSelection(view, sel);

  if (!editorOwnsSelection(view)) return;

  // The delayed drag selection causes issues with Cell Selections
  // in Safari. And the drag selection delay is to workaround issues
  // which only present in Chrome.
  if (
    !force &&
    view.input.mouseDown &&
    view.input.mouseDown.allowDefault &&
    browser.chrome
  ) {
    const domSel = view.domSelection();
    const curSel = view.domObserver.currentSelection;
    if (
      domSel.anchorNode &&
      curSel.anchorNode &&
      isEquivalentPosition(
        domSel.anchorNode,
        domSel.anchorOffset,
        curSel.anchorNode,
        curSel.anchorOffset,
      )
    ) {
      view.input.mouseDown.delayedSelectionSync = true;
      view.domObserver.setCurSelection();
      return;
    }
  }

  view.domObserver.disconnectSelection();

  if (view.cursorWrapper) {
    selectCursorWrapper(view);
  } else {
    const { anchor, head } = sel;
    let resetEditableFrom: HTMLElement;
    let resetEditableTo: HTMLElement;
    if (brokenSelectBetweenUneditable && !(sel instanceof TextSelection)) {
      if (!sel.$from.parent.inlineContent)
        resetEditableFrom = temporarilyEditableNear(view, sel.from);
      if (!sel.empty && !sel.$from.parent.inlineContent)
        resetEditableTo = temporarilyEditableNear(view, sel.to);
    }
    view.docView.setSelection(anchor, head, view.root, force);
    if (brokenSelectBetweenUneditable) {
      if (resetEditableFrom) resetEditable(resetEditableFrom);
      if (resetEditableTo) resetEditable(resetEditableTo);
    }
    // console.trace('sel2dom-添加hideSel', sel.visible, sel);
    if (sel.visible) {
      view.dom.classList.remove('ProseMirror-hideselection');
    } else {
      view.dom.classList.add('ProseMirror-hideselection');
      if ('onselectionchange' in document) removeClassOnSelectionChange(view);
    }
  }

  view.domObserver.setCurSelection();
  view.domObserver.connectSelection();
}

/** Kludge to work around Webkit not allowing a selection to start/end
 * between non-editable block nodes. We briefly make something
 * editable, set the selection, then set it uneditable again.
 */
const brokenSelectBetweenUneditable =
  browser.safari || (browser.chrome && browser.chrome_version < 63);

function temporarilyEditableNear(view: EditorView, pos: number) {
  const { node, offset } = view.docView.domFromPos(pos, 0);
  const after =
    offset < node.childNodes.length ? node.childNodes[offset] : null;
  const before = offset ? node.childNodes[offset - 1] : null;
  if (
    browser.safari &&
    after &&
    (after as HTMLElement).contentEditable == 'false'
  ) {
    return setEditable(after as HTMLElement);
  }

  if (
    (!after || (after as HTMLElement).contentEditable == 'false') &&
    (!before || (before as HTMLElement).contentEditable == 'false')
  ) {
    if (after) return setEditable(after as HTMLElement);
    else if (before) return setEditable(before as HTMLElement);
  }
}

/** 直接设置 `element.contentEditable = 'true';` */
function setEditable(element: HTMLElement) {
  element.contentEditable = 'true';
  if (browser.safari && element.draggable) {
    element.draggable = false;
    (element as any).wasDraggable = true;
  }
  return element;
}

/** 直接设置 `element.contentEditable = 'false';` */
function resetEditable(element: HTMLElement) {
  element.contentEditable = 'false';
  if ((element as any).wasDraggable) {
    element.draggable = true;
    (element as any).wasDraggable = null;
  }
}

function removeClassOnSelectionChange(view: EditorView) {
  const doc = view.dom.ownerDocument;
  doc.removeEventListener('selectionchange', view.input.hideSelectionGuard!);
  const domSel = view.domSelection();
  const node = domSel.anchorNode;
  const offset = domSel.anchorOffset;
  doc.addEventListener(
    'selectionchange',
    (view.input.hideSelectionGuard = () => {
      if (domSel.anchorNode != node || domSel.anchorOffset != offset) {
        doc.removeEventListener(
          'selectionchange',
          view.input.hideSelectionGuard!,
        );
        setTimeout(() => {
          if (!editorOwnsSelection(view) || view.state.selection.visible)
            view.dom.classList.remove('ProseMirror-hideselection');
        }, 20);
      }
    }),
  );
}

function selectCursorWrapper(view: EditorView) {
  const domSel = view.domSelection();
  const range = document.createRange();
  const node = view.cursorWrapper!.dom;
  const img = node.nodeName == 'IMG';
  if (img) {
    range.setEnd(node.parentNode!, domIndex(node) + 1);
  } else {
    range.setEnd(node, 0);
  }
  range.collapse(false);
  domSel.removeAllRanges();
  domSel.addRange(range);
  // Kludge to kill 'control selection' in IE11 when selecting an
  // invisible cursor wrapper, since that would result in those weird
  // resize handles and a selection that considers the absolutely
  // positioned wrapper, rather than the root editable node, the
  // focused element.
  if (
    !img &&
    !view.state.selection.visible &&
    browser.ie &&
    browser.ie_version <= 11
  ) {
    (node as any).disabled = true;
    (node as any).disabled = false;
  }
}

/** 将NodeSelection同步到vdom */
export function syncNodeSelection(view: EditorView, sel: Selection) {
  if (sel instanceof NodeSelection) {
    const desc = view.docView.descAt(sel.from);
    if (desc != view.lastSelectedViewDesc) {
      clearNodeSelection(view);
      if (desc) (desc as NodeViewDesc).selectNode();
      view.lastSelectedViewDesc = desc;
    }
  } else {
    clearNodeSelection(view);
  }
}

/** Clear all DOM statefulness of the last node selection. */
function clearNodeSelection(view: EditorView) {
  if (view.lastSelectedViewDesc) {
    if (view.lastSelectedViewDesc.parent) {
      (view.lastSelectedViewDesc as NodeViewDesc).deselectNode();
    }
    view.lastSelectedViewDesc = undefined;
  }
}

export function selectionBetween(
  view: EditorView,
  $anchor: ResolvedPos,
  $head: ResolvedPos,
  bias?: number,
) {
  let sel = view.someProp('createSelectionBetween', (f) =>
    f(view, $anchor, $head),
  );
  if (!sel) {
    sel = TextSelection.between($anchor, $head, bias);
  }
  // console.log(';; selectionBetween ', sel['visible'], sel);
  return sel;
}

export function hasFocusAndSelection(view: EditorView) {
  if (view.editable && !view.hasFocus()) return false;
  return hasSelection(view);
}

export function hasSelection(view: EditorView) {
  const sel = view.domSelection();
  if (!sel.anchorNode) return false;
  try {
    // Firefox will raise 'permission denied' errors when accessing
    // properties of `sel.anchorNode` when it's in a generated CSS
    // element.
    return (
      view.dom.contains(
        sel.anchorNode.nodeType === 3
          ? sel.anchorNode.parentNode
          : sel.anchorNode,
      ) &&
      (view.editable ||
        view.dom.contains(
          sel.focusNode!.nodeType === 3
            ? sel.focusNode!.parentNode
            : sel.focusNode,
        ))
    );
  } catch (_) {
    return false;
  }
}

export function anchorInRightPlace(view: EditorView) {
  const anchorDOM = view.docView.domFromPos(view.state.selection.anchor, 0);
  const domSel = view.domSelection();
  return isEquivalentPosition(
    anchorDOM.node,
    anchorDOM.offset,
    domSel.anchorNode!,
    domSel.anchorOffset,
  );
}
