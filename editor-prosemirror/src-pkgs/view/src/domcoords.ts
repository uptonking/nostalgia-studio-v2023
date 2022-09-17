import { EditorState } from 'prosemirror-state';

import * as browser from './browser';
import { nodeSize, parentNode, textRange } from './dom';
import { EditorView } from './index';
import { NodeViewDesc } from './viewdesc';

export type Rect = { left: number; right: number; top: number; bottom: number };

function windowRect(doc: Document): Rect {
  return {
    left: 0,
    right: doc.documentElement.clientWidth,
    top: 0,
    bottom: doc.documentElement.clientHeight,
  };
}

function getSide(value: number | Rect, side: keyof Rect): number {
  return typeof value === 'number' ? value : value[side];
}

function clientRect(node: HTMLElement): Rect {
  const rect = node.getBoundingClientRect();
  // Adjust for elements with style "transform: scale()"
  const scaleX = rect.width / node.offsetWidth || 1;
  const scaleY = rect.height / node.offsetHeight || 1;
  // Make sure scrollbar width isn't included in the rectangle
  return {
    left: rect.left,
    right: rect.left + node.clientWidth * scaleX,
    top: rect.top,
    bottom: rect.top + node.clientHeight * scaleY,
  };
}

export function scrollRectIntoView(
  view: EditorView,
  rect: Rect,
  startDOM: Node,
) {
  const scrollThreshold = view.someProp('scrollThreshold') || 0;
    const scrollMargin = view.someProp('scrollMargin') || 5;
  const doc = view.dom.ownerDocument;
  for (
    let parent: Node | null = startDOM || view.dom;
    ;
    parent = parentNode(parent)
  ) {
    if (!parent) break;
    if (parent.nodeType != 1) continue;
    const elt = parent as HTMLElement;
    const atTop = elt == doc.body;
    const bounding = atTop ? windowRect(doc) : clientRect(elt as HTMLElement);
    let moveX = 0;
      let moveY = 0;
    if (rect.top < bounding.top + getSide(scrollThreshold, 'top'))
      moveY = -(bounding.top - rect.top + getSide(scrollMargin, 'top'));
    else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, 'bottom'))
      moveY = rect.bottom - bounding.bottom + getSide(scrollMargin, 'bottom');
    if (rect.left < bounding.left + getSide(scrollThreshold, 'left'))
      moveX = -(bounding.left - rect.left + getSide(scrollMargin, 'left'));
    else if (rect.right > bounding.right - getSide(scrollThreshold, 'right'))
      moveX = rect.right - bounding.right + getSide(scrollMargin, 'right');
    if (moveX || moveY) {
      if (atTop) {
        doc.defaultView!.scrollBy(moveX, moveY);
      } else {
        const startX = elt.scrollLeft;
          const startY = elt.scrollTop;
        if (moveY) elt.scrollTop += moveY;
        if (moveX) elt.scrollLeft += moveX;
        const dX = elt.scrollLeft - startX;
          const dY = elt.scrollTop - startY;
        rect = {
          left: rect.left - dX,
          top: rect.top - dY,
          right: rect.right - dX,
          bottom: rect.bottom - dY,
        };
      }
    }
    if (atTop) break;
  }
}

/** Store the scroll position of the editor's parent nodes, along with
 * the top position of an element near the top of the editor, which
 * will be used to make sure the visible viewport remains stable even
 * when the size of the content above changes.
 */
export function storeScrollPos(view: EditorView): {
  refDOM: HTMLElement;
  refTop: number;
  stack: { dom: HTMLElement; top: number; left: number }[];
} {
  const rect = view.dom.getBoundingClientRect();
    const startY = Math.max(0, rect.top);
  let refDOM: HTMLElement; let refTop: number;
  for (
    let x = (rect.left + rect.right) / 2, y = startY + 1;
    y < Math.min(innerHeight, rect.bottom);
    y += 5
  ) {
    const dom = view.root.elementFromPoint(x, y);
    if (!dom || dom == view.dom || !view.dom.contains(dom)) continue;
    const localRect = (dom as HTMLElement).getBoundingClientRect();
    if (localRect.top >= startY - 20) {
      refDOM = dom as HTMLElement;
      refTop = localRect.top;
      break;
    }
  }
  return { refDOM: refDOM!, refTop: refTop!, stack: scrollStack(view.dom) };
}

function scrollStack(
  dom: Node,
): { dom: HTMLElement; top: number; left: number }[] {
  const stack = [];
    const doc = dom.ownerDocument;
  for (let cur: Node | null = dom; cur; cur = parentNode(cur)) {
    stack.push({
      dom: cur as HTMLElement,
      top: (cur as HTMLElement).scrollTop,
      left: (cur as HTMLElement).scrollLeft,
    });
    if (dom == doc) break;
  }
  return stack;
}

/** Reset the scroll position of the editor's parent nodes to that what
 * it was before, when storeScrollPos was called.
 */
export function resetScrollPos({
  refDOM,
  refTop,
  stack,
}: {
  refDOM: HTMLElement;
  refTop: number;
  stack: { dom: HTMLElement; top: number; left: number }[];
}) {
  const newRefTop = refDOM ? refDOM.getBoundingClientRect().top : 0;
  restoreScrollStack(stack, newRefTop == 0 ? 0 : newRefTop - refTop);
}

function restoreScrollStack(
  stack: { dom: HTMLElement; top: number; left: number }[],
  dTop: number,
) {
  for (let i = 0; i < stack.length; i++) {
    const { dom, top, left } = stack[i];
    if (dom.scrollTop != top + dTop) dom.scrollTop = top + dTop;
    if (dom.scrollLeft != left) dom.scrollLeft = left;
  }
}

let preventScrollSupported: false | null | { preventScroll: boolean } = null;
/** Feature-detects support for .focus({preventScroll: true}), and uses
 * a fallback kludge when not supported.
 */
export function focusPreventScroll(dom: HTMLElement) {
  if ((dom as any).setActive) return (dom as any).setActive(); // in IE
  if (preventScrollSupported) return dom.focus(preventScrollSupported);

  const stored = scrollStack(dom);
  dom.focus(
    preventScrollSupported == null
      ? {
          get preventScroll() {
            preventScrollSupported = { preventScroll: true };
            return true;
          },
        }
      : undefined,
  );
  if (!preventScrollSupported) {
    preventScrollSupported = false;
    restoreScrollStack(stored, 0);
  }
}

function findOffsetInNode(
  node: HTMLElement,
  coords: { top: number; left: number },
): { node: Node; offset: number } {
  let closest;
    let dxClosest = 2e8;
    let coordsClosest: { left: number; top: number } | undefined;
    let offset = 0;
  let rowBot = coords.top;
    let rowTop = coords.top;
  for (
    let child = node.firstChild, childIndex = 0;
    child;
    child = child.nextSibling, childIndex++
  ) {
    let rects;
    if (child.nodeType == 1) rects = (child as HTMLElement).getClientRects();
    else if (child.nodeType == 3)
      rects = textRange(child as Text).getClientRects();
    else continue;

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect.top <= rowBot && rect.bottom >= rowTop) {
        rowBot = Math.max(rect.bottom, rowBot);
        rowTop = Math.min(rect.top, rowTop);
        const dx =
          rect.left > coords.left
            ? rect.left - coords.left
            : rect.right < coords.left
            ? coords.left - rect.right
            : 0;
        if (dx < dxClosest) {
          closest = child;
          dxClosest = dx;
          coordsClosest =
            dx && closest.nodeType == 3
              ? {
                  left: rect.right < coords.left ? rect.right : rect.left,
                  top: coords.top,
                }
              : coords;
          if (child.nodeType == 1 && dx)
            offset =
              childIndex +
              (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0);
          continue;
        }
      }
      if (
        !closest &&
        ((coords.left >= rect.right && coords.top >= rect.top) ||
          (coords.left >= rect.left && coords.top >= rect.bottom))
      )
        offset = childIndex + 1;
    }
  }
  if (closest && closest.nodeType == 3)
    return findOffsetInText(closest as Text, coordsClosest!);
  if (!closest || (dxClosest && closest.nodeType == 1)) return { node, offset };
  return findOffsetInNode(closest as HTMLElement, coordsClosest!);
}

function findOffsetInText(node: Text, coords: { top: number; left: number }) {
  const len = node.nodeValue!.length;
  const range = document.createRange();
  for (let i = 0; i < len; i++) {
    range.setEnd(node, i + 1);
    range.setStart(node, i);
    const rect = singleRect(range, 1);
    if (rect.top == rect.bottom) continue;
    if (inRect(coords, rect))
      return {
        node,
        offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0),
      };
  }
  return { node, offset: 0 };
}

function inRect(coords: { top: number; left: number }, rect: Rect) {
  return (
    coords.left >= rect.left - 1 &&
    coords.left <= rect.right + 1 &&
    coords.top >= rect.top - 1 &&
    coords.top <= rect.bottom + 1
  );
}

function targetKludge(dom: HTMLElement, coords: { top: number; left: number }) {
  const parent = dom.parentNode;
  if (
    parent &&
    /^li$/i.test(parent.nodeName) &&
    coords.left < dom.getBoundingClientRect().left
  ) {
    return parent as HTMLElement;
  }
  return dom;
}

function posFromElement(
  view: EditorView,
  elt: HTMLElement,
  coords: { top: number; left: number },
) {
  const { node, offset } = findOffsetInNode(elt, coords);
    let bias = -1;
  if (node.nodeType == 1 && !node.firstChild) {
    const rect = (node as HTMLElement).getBoundingClientRect();
    bias =
      rect.left != rect.right && coords.left > (rect.left + rect.right) / 2
        ? 1
        : -1;
  }
  return view.docView.posFromDOM(node, offset, bias);
}

/** Browser (in `caretPosition/RangeFromPoint`) will aggressively
 * normalize towards nearby inline nodes. Since we are interested in
 * positions between block nodes too, we first walk up the hierarchy
 * of nodes to see if there are block nodes that the coordinates
 * fall outside of. If so, we take the position before/after that
 * block. If not, we call `posFromDOM` on the raw node/offset.
 */
function posFromCaret(
  view: EditorView,
  node: Node,
  offset: number,
  coords: { top: number; left: number },
) {
  let outside = -1;
  for (let cur = node; ; ) {
    if (cur == view.dom) break;
    const desc = view.docView.nearestDesc(cur, true);
    if (!desc) return null;
    if ((desc as NodeViewDesc).node.isBlock && desc.parent) {
      const rect = (desc.dom as HTMLElement).getBoundingClientRect();
      if (rect.left > coords.left || rect.top > coords.top)
        outside = desc.posBefore;
      else if (rect.right < coords.left || rect.bottom < coords.top)
        outside = desc.posAfter;
      else break;
    }
    cur = desc.dom.parentNode!;
  }
  return outside > -1 ? outside : view.docView.posFromDOM(node, offset, 1);
}

/**
 * 递归查找
 */
function elementFromPoint(
  element: HTMLElement,
  coords: { top: number; left: number },
  box: Rect,
): HTMLElement {
  const len = element.childNodes.length;
  if (len && box.top < box.bottom) {
    for (
      let startI = Math.max(
          0,
          Math.min(
            len - 1,
            Math.floor(
              (len * (coords.top - box.top)) / (box.bottom - box.top),
            ) - 2,
          ),
        ),
        i = startI;
      ;

    ) {
      const child = element.childNodes[i];
      if (child.nodeType == 1) {
        const rects = (child as HTMLElement).getClientRects();
        for (let j = 0; j < rects.length; j++) {
          const rect = rects[j];
          if (inRect(coords, rect)) {
            // 👇🏻
            return elementFromPoint(child as HTMLElement, coords, rect);
          }
        }
      }
      if ((i = (i + 1) % len) == startI) {
        break;
      }
    }
  }
  return element;
}

/** Given an x,y position on the editor, get the position in the document.
 * - 输入clientX/Y，计算在编辑器中对应的位置
 * - coords参数代表 x/y position within the current viewport，即clientX/Y
 */
export function posAtCoords(
  view: EditorView,
  coords: { top: number; left: number },
) {
  const doc = view.dom.ownerDocument;
  let node: Node | undefined;
  let offset = 0;

  // 💡 caretPositionFromPoint只有firefox浏览器支持，是标准属性
  if ((doc as any).caretPositionFromPoint) {
    try {
      // Firefox throws for this call in hard-to-predict circumstances (#994)
      const pos = (doc as any).caretPositionFromPoint(coords.left, coords.top);
      if (pos) ({ offsetNode: node, offset } = pos);
    } catch (_) {}
  }
  // 💡 caretRangeFromPoint只有firefox浏览器不支持，其他浏览器都支持，是非标准属性
  if (!node && doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(coords.left, coords.top);
    if (range) ({ startContainer: node, startOffset: offset } = range);
  }

  let elementAtCoords = (
    (view.root as any).elementFromPoint ? view.root : doc
  ).elementFromPoint(coords.left, coords.top) as HTMLElement;
  let pos: number;
  if (
    !elementAtCoords ||
    !view.dom.contains(
      elementAtCoords.nodeType !== 1
        ? elementAtCoords.parentNode
        : elementAtCoords,
    )
  ) {
    const box = view.dom.getBoundingClientRect();
    if (!inRect(coords, box)) return null;
    elementAtCoords = elementFromPoint(view.dom, coords, box);
    if (!elementAtCoords) return null;
  }
  // Safari's caretRangeFromPoint returns nonsense when on a draggable element
  if (browser.safari) {
    for (let p: Node | null = elementAtCoords; node && p; p = parentNode(p))
      if ((p as HTMLElement).draggable) node = undefined;
  }
  elementAtCoords = targetKludge(elementAtCoords, coords);

  if (node) {
    if (browser.gecko && node.nodeType === 1) {
      // Firefox will sometimes return offsets into <input> nodes, which
      // have no actual children, from caretPositionFromPoint (#953)
      offset = Math.min(offset, node.childNodes.length);
      // It'll also move the returned position before image nodes,
      // even if those are behind it.
      if (offset < node.childNodes.length) {
        const next = node.childNodes[offset];
        let box: DOMRect;
        if (
          next.nodeName == 'IMG' &&
          (box = (next as HTMLElement).getBoundingClientRect()).right <=
            coords.left &&
          box.bottom > coords.top
        )
          offset++;
      }
    }
    // Suspiciously specific kludge to work around caret*FromPoint
    // never returning a position at the end of the document
    if (
      node == view.dom &&
      offset == node.childNodes.length - 1 &&
      node.lastChild!.nodeType === 1 &&
      coords.top >
        (node.lastChild as HTMLElement).getBoundingClientRect().bottom
    ) {
      pos = view.state.doc.content.size;
    } else if (
      offset == 0 ||
      node.nodeType != 1 ||
      node.childNodes[offset - 1].nodeName != 'BR'
    ) {
      // Ignore positions directly after a BR, since caret*FromPoint
      // 'round up' positions that would be more accurately placed
      // before the BR node.
      pos = posFromCaret(view, node, offset, coords);
    }
  }
  if (pos == null) {
    pos = posFromElement(view, elementAtCoords, coords);
  }

  const desc = view.docView.nearestDesc(elementAtCoords, true);
  return { pos, inside: desc ? desc.posAtStart - desc.border : -1 };
}

function singleRect(target: HTMLElement | Range, bias: number): DOMRect {
  const rects = target.getClientRects();
  return !rects.length
    ? target.getBoundingClientRect()
    : rects[bias < 0 ? 0 : rects.length - 1];
}

const BIDI = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;

/** Given a position in the document model, get a bounding box of the
 * character at that position, relative to the window.
 */
export function coordsAtPos(view: EditorView, pos: number, side: number): Rect {
  const { node, offset, atom } = view.docView.domFromPos(pos, side < 0 ? -1 : 1);

  const supportEmptyRange = browser.webkit || browser.gecko;
  if (node.nodeType == 3) {
    // These browsers support querying empty text ranges. Prefer that in
    // bidi context or when at the end of a node.
    if (
      supportEmptyRange &&
      (BIDI.test(node.nodeValue!) ||
        (side < 0 ? !offset : offset == node.nodeValue!.length))
    ) {
      const rect = singleRect(textRange(node as Text, offset, offset), side);
      // Firefox returns bad results (the position before the space)
      // when querying a position directly after line-broken
      // whitespace. Detect this situation and and kludge around it
      if (
        browser.gecko &&
        offset &&
        /\s/.test(node.nodeValue![offset - 1]) &&
        offset < node.nodeValue!.length
      ) {
        const rectBefore = singleRect(
          textRange(node as Text, offset - 1, offset - 1),
          -1,
        );
        if (rectBefore.top == rect.top) {
          const rectAfter = singleRect(
            textRange(node as Text, offset, offset + 1),
            -1,
          );
          if (rectAfter.top != rect.top)
            return flattenV(rectAfter, rectAfter.left < rectBefore.left);
        }
      }
      return rect;
    } else {
      let from = offset;
        let to = offset;
        let takeSide = side < 0 ? 1 : -1;
      if (side < 0 && !offset) {
        to++;
        takeSide = -1;
      } else if (side >= 0 && offset == node.nodeValue!.length) {
        from--;
        takeSide = 1;
      } else if (side < 0) {
        from--;
      } else {
        to++;
      }
      return flattenV(
        singleRect(textRange(node as Text, from, to), 1),
        takeSide < 0,
      );
    }
  }

  const $dom = view.state.doc.resolve(pos - (atom || 0));
  // Return a horizontal line in block context
  if (!$dom.parent.inlineContent) {
    if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
      const before = node.childNodes[offset - 1];
      if (before.nodeType == 1)
        return flattenH((before as HTMLElement).getBoundingClientRect(), false);
    }
    if (atom == null && offset < nodeSize(node)) {
      const after = node.childNodes[offset];
      if (after.nodeType == 1)
        return flattenH((after as HTMLElement).getBoundingClientRect(), true);
    }
    return flattenH((node as HTMLElement).getBoundingClientRect(), side >= 0);
  }

  // Inline, not in text node (this is not Bidi-safe)
  if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
    const before = node.childNodes[offset - 1];
    const target =
      before.nodeType == 3
        ? textRange(
            before as Text,
            nodeSize(before) - (supportEmptyRange ? 0 : 1),
          )
        : // BR nodes tend to only return the rectangle before them.
        // Only use them if they are the last element in their parent
        before.nodeType == 1 && (before.nodeName != 'BR' || !before.nextSibling)
        ? before
        : null;
    if (target)
      return flattenV(singleRect(target as Range | HTMLElement, 1), false);
  }
  if (atom == null && offset < nodeSize(node)) {
    let after = node.childNodes[offset];
    while (after.pmViewDesc && after.pmViewDesc.ignoreForCoords)
      after = after.nextSibling!;
    const target = !after
      ? null
      : after.nodeType == 3
      ? textRange(after as Text, 0, supportEmptyRange ? 0 : 1)
      : after.nodeType == 1
      ? after
      : null;
    if (target)
      return flattenV(singleRect(target as Range | HTMLElement, -1), true);
  }
  // All else failed, just try to get a rectangle for the target node
  return flattenV(
    singleRect(
      node.nodeType == 3 ? textRange(node as Text) : (node as HTMLElement),
      -side,
    ),
    side >= 0,
  );
}

function flattenV(rect: DOMRect, left: boolean) {
  if (rect.width == 0) return rect;
  const x = left ? rect.left : rect.right;
  return { top: rect.top, bottom: rect.bottom, left: x, right: x };
}

function flattenH(rect: DOMRect, top: boolean) {
  if (rect.height == 0) return rect;
  const y = top ? rect.top : rect.bottom;
  return { top: y, bottom: y, left: rect.left, right: rect.right };
}

function withFlushedState<T>(
  view: EditorView,
  state: EditorState,
  f: () => T,
): T {
  const viewState = view.state;
    const active = view.root.activeElement as HTMLElement;
  if (viewState != state) view.updateState(state);
  if (active != view.dom) view.focus();
  try {
    return f();
  } finally {
    if (viewState != state) view.updateState(viewState);
    if (active != view.dom && active) active.focus();
  }
}

/** Whether vertical position motion in a given direction
 * from a position would leave a text block.
 */
function endOfTextblockVertical(
  view: EditorView,
  state: EditorState,
  dir: 'up' | 'down',
) {
  const sel = state.selection;
  const $pos = dir == 'up' ? sel.$from : sel.$to;
  return withFlushedState(view, state, () => {
    let { node: dom } = view.docView.domFromPos($pos.pos, dir == 'up' ? -1 : 1);
    for (;;) {
      const nearest = view.docView.nearestDesc(dom, true);
      if (!nearest) break;
      if (nearest.node!.isBlock) {
        dom = nearest.dom;
        break;
      }
      dom = nearest.dom.parentNode!;
    }
    const coords = coordsAtPos(view, $pos.pos, 1);
    for (let child = dom.firstChild; child; child = child.nextSibling) {
      let boxes;
      if (child.nodeType == 1) boxes = (child as HTMLElement).getClientRects();
      else if (child.nodeType == 3)
        boxes = textRange(
          child as Text,
          0,
          child.nodeValue!.length,
        ).getClientRects();
      else continue;
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        if (
          box.bottom > box.top + 1 &&
          (dir == 'up'
            ? coords.top - box.top > (box.bottom - coords.top) * 2
            : box.bottom - coords.bottom > (coords.bottom - box.top) * 2)
        )
          return false;
      }
    }
    return true;
  });
}

const maybeRTL = /[\u0590-\u08ac]/;

function endOfTextblockHorizontal(
  view: EditorView,
  state: EditorState,
  dir: 'left' | 'right' | 'forward' | 'backward',
) {
  const { $head } = state.selection;
  if (!$head.parent.isTextblock) return false;
  const offset = $head.parentOffset;
    const atStart = !offset;
    const atEnd = offset == $head.parent.content.size;
  const sel = view.domSelection();
  // If the textblock is all LTR, or the browser doesn't support
  // Selection.modify (Edge), fall back to a primitive approach
  if (!maybeRTL.test($head.parent.textContent) || !(sel as any).modify)
    return dir == 'left' || dir == 'backward' ? atStart : atEnd;

  return withFlushedState(view, state, () => {
    // This is a huge hack, but appears to be the best we can
    // currently do: use `Selection.modify` to move the selection by
    // one character, and see if that moves the cursor out of the
    // textblock (or doesn't move it at all, when at the start/end of
    // the document).
    const oldRange = sel.getRangeAt(0);
      const oldNode = sel.focusNode;
      const oldOff = sel.focusOffset;
    const oldBidiLevel = (sel as any).caretBidiLevel; // Only for Firefox
    (sel as any).modify('move', dir, 'character');
    const parentDOM = $head.depth
      ? view.docView.domAfterPos($head.before())
      : view.dom;
    const result =
      !parentDOM.contains(
        sel.focusNode!.nodeType == 1
          ? sel.focusNode
          : sel.focusNode!.parentNode,
      ) ||
      (oldNode == sel.focusNode && oldOff == sel.focusOffset);
    // Restore the previous selection
    sel.removeAllRanges();
    sel.addRange(oldRange);
    if (oldBidiLevel != null) (sel as any).caretBidiLevel = oldBidiLevel;
    return result;
  });
}

export type TextblockDir =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'forward'
  | 'backward';

let cachedState: EditorState | null = null;
let cachedDir: TextblockDir | null = null;
let cachedResult: boolean = false;
export function endOfTextblock(
  view: EditorView,
  state: EditorState,
  dir: TextblockDir,
) {
  if (cachedState == state && cachedDir == dir) return cachedResult;
  cachedState = state;
  cachedDir = dir;
  return (cachedResult =
    dir == 'up' || dir == 'down'
      ? endOfTextblockVertical(view, state, dir)
      : endOfTextblockHorizontal(view, state, dir));
}
