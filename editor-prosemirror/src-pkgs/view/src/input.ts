import { Node, Slice } from 'prosemirror-model';
import { NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import { dropPoint } from 'prosemirror-transform';

import * as browser from './browser';
import { captureKeyDown } from './capturekeys';
import { parseFromClipboard, serializeForClipboard } from './clipboard';
import { DOMNode, keyEvent } from './dom';
import { EditorView } from './index';
import {
  selectionBetween,
  selectionFromDOM,
  selectionToDOM,
} from './selection';
import { ViewDesc } from './viewdesc';

type EventHandlerMap = {
  [event: string]: (view: EditorView, event: Event) => void;
};
const editHandlers: EventHandlerMap = {};
/** A collection of DOM events that occur within the editor, and callback functions
 * to invoke when the event fires.
 * - 上面`editHandlers`映射表的key都会被拷贝到这个映射表handlers
 */
const handlers: EventHandlerMap = {};
const passiveHandlers: Record<string, boolean> = {
  touchstart: true,
  touchmove: true,
};

/** 在EditorView中保存输入相关状态 */
export class InputState {
  shiftKey = false;
  mouseDown: MouseDown | null = null;
  lastKeyCode: number | null = null;
  lastKeyCodeTime = 0;
  lastClick = { time: 0, x: 0, y: 0, type: '' };
  lastSelectionOrigin: string | null = null;
  lastSelectionTime = 0;
  lastIOSEnter = 0;
  lastIOSEnterFallbackTimeout = -1;
  lastFocus = 0;
  lastTouch = 0;
  lastAndroidDelete = 0;
  composing = false;
  composingTimeout = -1;
  compositionNodes: ViewDesc[] = [];
  compositionEndedAt = -2e8;
  domChangeCount = 0;
  eventHandlers: { [event: string]: (event: Event) => void } =
    Object.create(null);
  hideSelectionGuard: (() => void) | null = null;
}

/**
 * 遍历handlers映射表，注册所有key代表的event到编辑器view.dom，然后 ensureListeners
 */
export function initInput(view: EditorView) {
  for (const event in handlers) {
    const handler = handlers[event];
    view.dom.addEventListener(
      event,
      (view.input.eventHandlers[event] = (event: Event) => {
        if (
          eventBelongsToView(view, event) &&
          !runCustomHandler(view, event) &&
          (view.editable || !(event.type in editHandlers))
        ) {
          handler(view, event);
        }
      }),
      passiveHandlers[event] ? { passive: true } : undefined,
    );
  }

  // On Safari, for reasons beyond my understanding, adding an input
  // event handler makes an issue where the composition vanishes when
  // you press enter go away.
  if (browser.safari) {
    view.dom.addEventListener('input', () => null);
  }

  ensureListeners(view);
}

export function destroyInput(view: EditorView) {
  view.domObserver.stop();
  for (let type in view.input.eventHandlers) {
    view.dom.removeEventListener(type, view.input.eventHandlers[type]);
  }
  clearTimeout(view.input.composingTimeout);
  clearTimeout(view.input.lastIOSEnterFallbackTimeout);
}

/** 依次遍历并执行作为直接props提供的、作为plugin的props提供的事件处理函数 */
export function ensureListeners(view: EditorView) {
  view.someProp('handleDOMEvents', (currentHandlers) => {
    for (let type in currentHandlers) {
      if (!view.input.eventHandlers[type]) {
        view.dom.addEventListener(
          type,
          (view.input.eventHandlers[type] = (event) =>
            runCustomHandler(view, event)),
        );
      }
    }
  });
}

/** 遍历并执行`event.type`类型的事件处理函数 */
function runCustomHandler(view: EditorView, event: Event) {
  return view.someProp('handleDOMEvents', (handlers) => {
    let handler = handlers[event.type];
    return handler ? handler(view, event) || event.defaultPrevented : false;
  });
}

function eventBelongsToView(view: EditorView, event: Event) {
  if (!event.bubbles) return true;
  if (event.defaultPrevented) return false;
  for (
    let node = event.target as DOMNode;
    node != view.dom;
    node = node.parentNode!
  ) {
    if (
      !node ||
      node.nodeType == 11 ||
      (node.pmViewDesc && node.pmViewDesc.stopEvent(event))
      // 11代表Node.DOCUMENT_FRAGMENT_NODE，A DocumentFragment node.
    ) {
      return false;
    }
  }
  return true;
}

/** 在执行自定义e.type事件函数返回值不是true时，触发执行handlers映射表中e.type事件处理函数 */
export function dispatchEvent(view: EditorView, event: Event) {
  if (
    !runCustomHandler(view, event) &&
    handlers[event.type] &&
    (view.editable || !(event.type in editHandlers))
  ) {
    handlers[event.type](view, event);
  }
}

/**
 * - `beforeinput`目前的逻辑非常少，大多数输入相关的逻辑在`keypress`事件
 * We should probably do more with `beforeinput` events, but support
 * is so spotty that I'm still waiting to see where they are going.
 */
handlers.beforeinput = (view, _event: Event) => {
  const event = _event as InputEvent;

  // Very specific hack to deal with backspace sometimes failing on
  // Chrome Android when after an uneditable node.
  if (
    browser.chrome &&
    browser.android &&
    event.inputType == 'deleteContentBackward'
  ) {
    view.domObserver.flushSoon();
    const { domChangeCount } = view.input;
    setTimeout(() => {
      if (view.input.domChangeCount != domChangeCount) return; // Event already had some effect
      // This bug tends to close the virtual keyboard, so we refocus
      view.dom.blur();
      view.focus();
      if (
        view.someProp('handleKeyDown', (f) => f(view, keyEvent(8, 'Backspace')))
      ) {
        return;
      }
      const { $cursor } = view.state.selection as TextSelection;
      // Crude approximation of backspace behavior when no command handled it
      if ($cursor && $cursor.pos > 0) {
        view.dispatch(
          view.state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView(),
        );
      }
    }, 50);
  }
};

editHandlers.keydown = (view: EditorView, _event: Event) => {
  let event = _event as KeyboardEvent;
  view.input.shiftKey = event.keyCode === 16 || event.shiftKey;
  if (inOrNearComposition(view, event)) return;
  view.input.lastKeyCode = event.keyCode;
  view.input.lastKeyCodeTime = Date.now();
  // Suppress enter key events on Chrome Android, because those tend
  // to be part of a confused sequence of composition events fired,
  // and handling them eagerly tends to corrupt the input.
  if (browser.android && browser.chrome && event.keyCode == 13) return;
  if (event.keyCode !== 229) view.domObserver.forceFlush();

  // On iOS, if we preventDefault enter key presses, the virtual
  // keyboard gets confused. So the hack here is to set a flag that
  // makes the DOM change code recognize that what just happens should
  // be replaced by whatever the Enter key handlers do.
  if (
    browser.ios &&
    event.keyCode === 13 &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    const now = Date.now();
    view.input.lastIOSEnter = now;
    view.input.lastIOSEnterFallbackTimeout = window.setTimeout(() => {
      if (view.input.lastIOSEnter == now) {
        view.someProp('handleKeyDown', (f) => f(view, keyEvent(13, 'Enter')));
        view.input.lastIOSEnter = 0;
      }
    }, 200);
  } else if (
    view.someProp('handleKeyDown', (f) => f(view, event)) ||
    captureKeyDown(view, event)
  ) {
    event.preventDefault();
  } else {
    setSelectionOrigin(view, 'key');
  }
};

editHandlers.keyup = (view, event) => {
  if ((event as KeyboardEvent).keyCode == 16) {
    view.input.shiftKey = false;
  }
};

/**  常用的输入相关逻辑暂时都在`keypress`，而不在`beforeinput`，待迁移
 * - Since `keypress` event has been deprecated, you should use `beforeinput` or `keydown` instead.
 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/keypress_event
 */
editHandlers.keypress = (view, _event) => {
  const event = _event as KeyboardEvent;
  if (
    inOrNearComposition(view, event) ||
    !event.charCode ||
    (event.ctrlKey && !event.altKey) ||
    (browser.mac && event.metaKey)
  ) {
    return;
  }

  if (view.someProp('handleKeyPress', (f) => f(view, event))) {
    event.preventDefault();
    return;
  }

  const sel = view.state.selection;
  if (!(sel instanceof TextSelection) || !sel.$from.sameParent(sel.$to)) {
    /// 若当前selection不是TextSelection或光标的起始和终止节点不同（选中了内容则需要进行删除处理）
    const text = String.fromCharCode(event.charCode);
    if (
      !view.someProp('handleTextInput', (f) =>
        f(view, sel.$from.pos, sel.$to.pos, text),
      )
    ) {
      // 👉🏻 简单的输入事件会执行一个insertText的操作去修改state
      view.dispatch(view.state.tr.insertText(text).scrollIntoView());
    }
    event.preventDefault();
  }
};

/** 返回鼠标事件的event.clientX/Y */
function eventCoords(event: MouseEvent) {
  return { left: event.clientX, top: event.clientY };
}

/** 若本次点击位置的clientX/Y在上次点击位置的上下左右10px之内，则认为是near */
function isNear(event: MouseEvent, click: { x: number; y: number }) {
  const dx = click.x - event.clientX;
  const dy = click.y - event.clientY;
  return dx * dx + dy * dy < 100;
}

function runHandlerOnContext(
  view: EditorView,
  propName: 'handleClickOn' | 'handleDoubleClickOn' | 'handleTripleClickOn',
  pos: number,
  inside: number,
  event: MouseEvent,
) {
  if (inside == -1) return false;
  let $pos = view.state.doc.resolve(inside);

  for (let i = $pos.depth + 1; i > 0; i--) {
    if (
      view.someProp(propName, (f) =>
        i > $pos.depth
          ? f(view, pos, $pos.nodeAfter!, $pos.before(i), event, true)
          : f(view, pos, $pos.node(i), $pos.before(i), event, false),
      )
    ) {
      return true;
    }
  }

  return false;
}

function setSelectionOrigin(view: EditorView, origin: string) {
  view.input.lastSelectionOrigin = origin;
  view.input.lastSelectionTime = Date.now();
}

/** 通过 `tr = view.state.tr.setSelection` + `view.dispatch(tr)` 两步实现 */
function updateSelection(
  view: EditorView,
  selection: Selection,
  origin: string,
) {
  if (!view.focused) view.focus();
  const tr = view.state.tr.setSelection(selection);
  if (origin == 'pointer') tr.setMeta('pointer', true);
  view.dispatch(tr);
}

function selectClickedLeaf(view: EditorView, inside: number) {
  if (inside == -1) return false;
  const $pos = view.state.doc.resolve(inside);
  const node = $pos.nodeAfter;

  if (node && node.isAtom && NodeSelection.isSelectable(node)) {
    updateSelection(view, new NodeSelection($pos), 'pointer');
    return true;
  }

  return false;
}

function selectClickedNode(view: EditorView, inside: number) {
  if (inside == -1) return false;
  const sel = view.state.selection;
  let selectedNode: Node;
  let selectAt: number;
  if (sel instanceof NodeSelection) selectedNode = sel.node;

  const $pos = view.state.doc.resolve(inside);
  for (let i = $pos.depth + 1; i > 0; i--) {
    const node = i > $pos.depth ? $pos.nodeAfter! : $pos.node(i);
    if (NodeSelection.isSelectable(node)) {
      if (
        selectedNode &&
        sel.$from.depth > 0 &&
        i >= sel.$from.depth &&
        $pos.before(sel.$from.depth + 1) == sel.$from.pos
      ) {
        selectAt = $pos.before(sel.$from.depth);
      } else {
        selectAt = $pos.before(i);
      }
      break;
    }
  }

  if (selectAt != null) {
    updateSelection(
      view,
      NodeSelection.create(view.state.doc, selectAt),
      'pointer',
    );
    return true;
  } else {
    return false;
  }
}

/** 此方法会在MouseDown类的构造函数中注册，依次执行props中的handleClick，若返回true就结束 */
function handleSingleClick(
  view: EditorView,
  pos: number,
  inside: number,
  event: MouseEvent,
  selectNode: boolean,
) {
  return (
    runHandlerOnContext(view, 'handleClickOn', pos, inside, event) ||
    view.someProp('handleClick', (f) => f(view, pos, event)) ||
    (selectNode
      ? selectClickedNode(view, inside)
      : selectClickedLeaf(view, inside))
  );
}

function handleDoubleClick(
  view: EditorView,
  pos: number,
  inside: number,
  event: MouseEvent,
) {
  return (
    runHandlerOnContext(view, 'handleDoubleClickOn', pos, inside, event) ||
    view.someProp('handleDoubleClick', (f) => f(view, pos, event))
  );
}

function handleTripleClick(
  view: EditorView,
  pos: number,
  inside: number,
  event: MouseEvent,
) {
  return (
    runHandlerOnContext(view, 'handleTripleClickOn', pos, inside, event) ||
    view.someProp('handleTripleClick', (f) => f(view, pos, event)) ||
    defaultTripleClick(view, inside, event)
  );
}

function defaultTripleClick(
  view: EditorView,
  inside: number,
  event: MouseEvent,
) {
  if (event.button != 0) return false;
  let doc = view.state.doc;
  if (inside == -1) {
    if (doc.inlineContent) {
      updateSelection(
        view,
        TextSelection.create(doc, 0, doc.content.size),
        'pointer',
      );
      return true;
    }
    return false;
  }

  let $pos = doc.resolve(inside);
  for (let i = $pos.depth + 1; i > 0; i--) {
    let node = i > $pos.depth ? $pos.nodeAfter! : $pos.node(i);
    let nodePos = $pos.before(i);
    if (node.inlineContent)
      updateSelection(
        view,
        TextSelection.create(doc, nodePos + 1, nodePos + 1 + node.content.size),
        'pointer',
      );
    else if (NodeSelection.isSelectable(node))
      updateSelection(view, NodeSelection.create(doc, nodePos), 'pointer');
    else continue;
    return true;
  }
}

/** 直接调用 `endComposition()` */
function forceDOMFlush(view: EditorView) {
  return endComposition(view);
}

/** 根据操作系统返回字符串 `metaKey` 或 `ctrlKey` */
const selectNodeModifier: keyof MouseEvent = browser.mac
  ? 'metaKey'
  : 'ctrlKey';

/** 鼠标相关事件的管理器，
 * - 构造函数中会初始化鼠标事件相关数据，触发domObserver.start()
 * - 会在页面顶层document上注册mouseup/move事件，mouseup中包含单击的事件处理逻辑
 */
class MouseDown {
  startDoc: Node;
  selectNode: boolean;
  /** 初始值是event.shiftKey */
  allowDefault: boolean;
  delayedSelectionSync = false;
  mightDrag: {
    node: Node;
    pos: number;
    addAttr: boolean;
    setUneditable: boolean;
  } | null = null;
  target: HTMLElement | null;

  constructor(
    readonly view: EditorView,
    readonly pos: { pos: number; inside: number },
    readonly event: MouseEvent,
    readonly flushed: boolean,
  ) {
    this.startDoc = view.state.doc;
    this.selectNode = !!event[selectNodeModifier];
    this.allowDefault = event.shiftKey;

    this.up = this.up.bind(this);
    this.move = this.move.bind(this);

    let targetNode: Node;
    let targetPos: number;
    if (pos.inside > -1) {
      targetNode = view.state.doc.nodeAt(pos.inside)!;
      targetPos = pos.inside;
    } else {
      let $pos = view.state.doc.resolve(pos.pos);
      targetNode = $pos.parent;
      targetPos = $pos.depth ? $pos.before() : 0;
    }

    const target = flushed ? null : (event.target as HTMLElement);
    const targetDesc = target ? view.docView.nearestDesc(target, true) : null;
    this.target = targetDesc ? (targetDesc.dom as HTMLElement) : null;

    let { selection } = view.state;
    if (
      (event.button == 0 &&
        targetNode.type.spec.draggable &&
        targetNode.type.spec.selectable !== false) ||
      (selection instanceof NodeSelection &&
        selection.from <= targetPos &&
        selection.to > targetPos)
    ) {
      this.mightDrag = {
        node: targetNode,
        pos: targetPos,
        addAttr: !!(this.target && !this.target.draggable),
        setUneditable: !!(
          this.target &&
          browser.gecko &&
          !this.target.hasAttribute('contentEditable')
        ),
      };
    }

    if (
      this.target &&
      this.mightDrag &&
      (this.mightDrag.addAttr || this.mightDrag.setUneditable)
    ) {
      this.view.domObserver.stop();
      if (this.mightDrag.addAttr) this.target.draggable = true;
      if (this.mightDrag.setUneditable) {
        setTimeout(() => {
          if (this.view.input.mouseDown == this) {
            this.target!.setAttribute('contentEditable', 'false');
          }
        }, 20);
      }
      this.view.domObserver.start();
    }

    view.root.addEventListener('mouseup', this.up);
    view.root.addEventListener('mousemove', this.move);
    setSelectionOrigin(view, 'pointer');
  }

  /** 清除eventListeners-up/move-drag，延迟执行selectionToDOM */
  done() {
    this.view.root.removeEventListener('mouseup', this.up as any);
    this.view.root.removeEventListener('mousemove', this.move as any);
    if (this.mightDrag && this.target) {
      this.view.domObserver.stop();
      if (this.mightDrag.addAttr) {
        this.target.removeAttribute('draggable');
      }
      if (this.mightDrag.setUneditable) {
        this.target.removeAttribute('contentEditable');
      }
      this.view.domObserver.start();
    }
    if (this.delayedSelectionSync) {
      setTimeout(() => selectionToDOM(this.view));
    }
    this.view.input.mouseDown = null;
  }

  /** 在鼠标松开时，更新相关状态 */
  up(event: MouseEvent) {
    this.done();

    if (!this.view.dom.contains(event.target as HTMLElement)) return;

    let pos: { pos: number; inside: number } | null = this.pos;
    if (this.view.state.doc != this.startDoc) {
      pos = this.view.posAtCoords(eventCoords(event));
    }

    this.updateAllowDefault(event);
    if (this.allowDefault || !pos) {
      setSelectionOrigin(this.view, 'pointer');
    } else if (
      handleSingleClick(this.view, pos.pos, pos.inside, event, this.selectNode)
    ) {
      event.preventDefault();
    } else if (
      event.button == 0 &&
      (this.flushed ||
        // Safari ignores clicks on draggable elements
        (browser.safari && this.mightDrag && !this.mightDrag.node.isAtom) ||
        // Chrome will sometimes treat a node selection as a
        // cursor, but still report that the node is selected
        // when asked through getSelection. You'll then get a
        // situation where clicking at the point where that
        // (hidden) cursor is doesn't change the selection, and
        // thus doesn't get a reaction from ProseMirror. This
        // works around that.
        (browser.chrome &&
          !this.view.state.selection.visible &&
          Math.min(
            Math.abs(pos.pos - this.view.state.selection.from),
            Math.abs(pos.pos - this.view.state.selection.to),
          ) <= 2))
    ) {
      updateSelection(
        this.view,
        Selection.near(this.view.state.doc.resolve(pos.pos)),
        'pointer',
      );
      event.preventDefault();
    } else {
      setSelectionOrigin(this.view, 'pointer');
    }
  }

  move(event: MouseEvent) {
    this.updateAllowDefault(event);
    setSelectionOrigin(this.view, 'pointer');
    if (event.buttons == 0) this.done();
  }

  /** 只有本次点击位置的clientX/Y比上次大于4px才执行 this.allowDefault = true */
  updateAllowDefault(event: MouseEvent) {
    if (
      !this.allowDefault &&
      (Math.abs(this.event.x - event.clientX) > 4 ||
        Math.abs(this.event.y - event.clientY) > 4)
    ) {
      this.allowDefault = true;
    }
  }
}

/**
 * - 包含双击、三击的判断逻辑
 * - 鼠标点击事件的执行在mouseup事件处理函数，而不在这里的mousedown函数
 */
handlers.mousedown = (view, _event) => {
  let event = _event as MouseEvent;
  view.input.shiftKey = event.shiftKey;
  let flushed = forceDOMFlush(view);
  let now = Date.now();
  let type: 'singleClick' | 'doubleClick' | 'tripleClick' = 'singleClick';

  if (
    now - view.input.lastClick.time < 500 &&
    isNear(event, view.input.lastClick) &&
    !event[selectNodeModifier]
  ) {
    if (view.input.lastClick.type == 'singleClick') type = 'doubleClick';
    else if (view.input.lastClick.type == 'doubleClick') type = 'tripleClick';
  }

  view.input.lastClick = {
    time: now,
    x: event.clientX,
    y: event.clientY,
    type,
  };

  let pos = view.posAtCoords(eventCoords(event));
  if (!pos) return;

  if (type == 'singleClick') {
    if (view.input.mouseDown) {
      view.input.mouseDown.done();
    }
    view.input.mouseDown = new MouseDown(view, pos, event, !!flushed);
  } else if (
    (type == 'doubleClick' ? handleDoubleClick : handleTripleClick)(
      view,
      pos.pos,
      pos.inside,
      event,
    )
  ) {
    event.preventDefault();
  } else {
    setSelectionOrigin(view, 'pointer');
  }
};

handlers.touchstart = (view) => {
  view.input.lastTouch = Date.now();
  forceDOMFlush(view);
  setSelectionOrigin(view, 'pointer');
};

handlers.touchmove = (view) => {
  view.input.lastTouch = Date.now();
  setSelectionOrigin(view, 'pointer');
};

handlers.contextmenu = (view) => forceDOMFlush(view);

function inOrNearComposition(view: EditorView, event: Event) {
  if (view.composing) return true;
  // See https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/.
  // On Japanese input method editors (IMEs), the Enter key is used to confirm character
  // selection. On Safari, when Enter is pressed, compositionend and keydown events are
  // emitted. The keydown event triggers newline insertion, which we don't want.
  // This method returns true if the keydown event should be ignored.
  // We only ignore it once, as pressing Enter a second time *should* insert a newline.
  // Furthermore, the keydown event timestamp must be close to the compositionEndedAt timestamp.
  // This guards against the case where compositionend is triggered without the keyboard
  // (e.g. character confirmation may be done with the mouse), and keydown is triggered
  // afterwards- we wouldn't want to ignore the keydown event in this case.
  if (
    browser.safari &&
    Math.abs(event.timeStamp - view.input.compositionEndedAt) < 500
  ) {
    view.input.compositionEndedAt = -2e8; // 2e3 > 2000
    return true;
  }

  return false;
}

/** Drop active composition after 5 seconds of inactivity on Android */
const timeoutComposition = browser.android ? 5000 : -1;

editHandlers.compositionstart = editHandlers.compositionupdate = (view) => {
  if (!view.composing) {
    view.domObserver.flush();
    const { state } = view;
    const $pos = state.selection.$from;
    if (
      state.selection.empty &&
      (state.storedMarks ||
        (!$pos.textOffset &&
          $pos.parentOffset &&
          $pos.nodeBefore!.marks.some((m) => m.type.spec.inclusive === false)))
    ) {
      // Need to wrap the cursor in mark nodes different from the ones in the DOM context
      view.markCursor = view.state.storedMarks || $pos.marks();
      endComposition(view, true);
      view.markCursor = null;
    } else {
      endComposition(view);
      // In firefox, if the cursor is after but outside a marked node,
      // the inserted text won't inherit the marks. So this moves it
      // inside if necessary.
      if (
        browser.gecko &&
        state.selection.empty &&
        $pos.parentOffset &&
        !$pos.textOffset &&
        $pos.nodeBefore!.marks.length
      ) {
        const sel = view.domSelection();
        for (
          let node = sel.focusNode, offset = sel.focusOffset;
          node && node.nodeType == 1 && offset != 0;

        ) {
          const before =
            offset < 0 ? node.lastChild : node.childNodes[offset - 1];
          if (!before) break;
          if (before.nodeType == 3) {
            sel.collapse(before, before.nodeValue!.length);
            break;
          } else {
            node = before;
            offset = -1;
          }
        }
      }
    }
    view.input.composing = true;
  }

  scheduleComposeEnd(view, timeoutComposition);
};

editHandlers.compositionend = (view, event) => {
  if (view.composing) {
    view.input.composing = false;
    view.input.compositionEndedAt = event.timeStamp;
    scheduleComposeEnd(view, 20);
  }
};

function scheduleComposeEnd(view: EditorView, delay: number) {
  clearTimeout(view.input.composingTimeout);
  if (delay > -1) {
    view.input.composingTimeout = window.setTimeout(
      () => endComposition(view),
      delay,
    );
  }
}

export function clearComposition(view: EditorView) {
  if (view.composing) {
    view.input.composing = false;
    view.input.compositionEndedAt = timestampFromCustomEvent();
  }
  while (view.input.compositionNodes.length > 0) {
    view.input.compositionNodes.pop()!.markParentsDirty();
  }
}

/// @internal
/**
 * - 执行 domObserver.forceFlush();
 * - 执行 view.updateState()
 */
export function endComposition(view: EditorView, forceUpdate = false) {
  if (browser.android && view.domObserver.flushingSoon >= 0) return;
  view.domObserver.forceFlush();
  clearComposition(view);

  if (forceUpdate || (view.docView && view.docView.dirty)) {
    const sel = selectionFromDOM(view);
    if (sel && !sel.eq(view.state.selection)) {
      view.dispatch(view.state.tr.setSelection(sel));
    } else {
      view.updateState(view.state);
    }
    return true;
  }

  return false;
}

function timestampFromCustomEvent() {
  const event = document.createEvent('Event');
  event.initEvent('event', true, true);
  return event.timeStamp;
}

function captureCopy(view: EditorView, dom: HTMLElement) {
  // The extra wrapper is somehow necessary on IE/Edge to prevent the
  // content from being mangled when it is put onto the clipboard
  if (!view.dom.parentNode) return;
  const wrap = view.dom.parentNode.appendChild(document.createElement('div'));
  wrap.appendChild(dom);
  wrap.style.cssText = 'position: fixed; left: -10000px; top: 10px';
  const sel = getSelection()!;
  const range = document.createRange();
  range.selectNodeContents(dom);
  // Done because IE will fire a selectionchange moving the selection
  // to its start when removeAllRanges is called and the editor still
  // has focus (which will mess up the editor's selection state).
  view.dom.blur();
  sel.removeAllRanges();
  sel.addRange(range);
  setTimeout(() => {
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    view.focus();
  }, 50);
}

/** This is very crude, but unfortunately both these browsers _pretend_
 * that they have a clipboard API—all the objects and methods are
 * there, they just don't work, and they are hard to test.
 */
const brokenClipboardAPI =
  (browser.ie && browser.ie_version < 15) ||
  (browser.ios && browser.webkit_version < 604);

handlers.copy = editHandlers.cut = (view, _event) => {
  let event = _event as ClipboardEvent;
  let sel = view.state.selection,
    cut = event.type == 'cut';
  if (sel.empty) return;

  // IE and Edge's clipboard interface is completely broken
  let data = brokenClipboardAPI ? null : event.clipboardData;
  let slice = sel.content(),
    { dom, text } = serializeForClipboard(view, slice);
  if (data) {
    event.preventDefault();
    data.clearData();
    data.setData('text/html', dom.innerHTML);
    data.setData('text/plain', text);
  } else {
    captureCopy(view, dom);
  }
  if (cut) {
    view.dispatch(
      view.state.tr
        .deleteSelection()
        .scrollIntoView()
        .setMeta('uiEvent', 'cut'),
    );
  }
};

function sliceSingleNode(slice: Slice) {
  return slice.openStart == 0 &&
    slice.openEnd == 0 &&
    slice.content.childCount == 1
    ? slice.content.firstChild
    : null;
}

function capturePaste(view: EditorView, event: ClipboardEvent) {
  if (!view.dom.parentNode) return;
  let plainText =
    view.input.shiftKey || view.state.selection.$from.parent.type.spec.code;
  let target = view.dom.parentNode.appendChild(
    document.createElement(plainText ? 'textarea' : 'div'),
  );
  if (!plainText) target.contentEditable = 'true';
  target.style.cssText = 'position: fixed; left: -10000px; top: 10px';
  target.focus();
  setTimeout(() => {
    view.focus();
    if (target.parentNode) target.parentNode.removeChild(target);
    if (plainText)
      doPaste(view, (target as HTMLTextAreaElement).value, null, event);
    else doPaste(view, target.textContent!, target.innerHTML, event);
  }, 50);
}

function doPaste(
  view: EditorView,
  text: string,
  html: string | null,
  event: ClipboardEvent,
) {
  const slice = parseFromClipboard(
    view,
    text,
    html,
    view.input.shiftKey,
    view.state.selection.$from,
  );
  if (
    view.someProp('handlePaste', (f) => f(view, event, slice || Slice.empty))
  ) {
    return true;
  }
  if (!slice) return false;

  const singleNode = sliceSingleNode(slice);
  const tr = singleNode
    ? view.state.tr.replaceSelectionWith(singleNode, view.input.shiftKey)
    : view.state.tr.replaceSelection(slice);
  view.dispatch(
    tr.scrollIntoView().setMeta('paste', true).setMeta('uiEvent', 'paste'),
  );

  return true;
}

editHandlers.paste = (view, _event) => {
  const event = _event as ClipboardEvent;
  // Handling paste from JavaScript during composition is very poorly
  // handled by browsers, so as a dodgy but preferable kludge, we just
  // let the browser do its native thing there, except on Android,
  // where the editor is almost always composing.
  if (view.composing && !browser.android) return;
  const data = brokenClipboardAPI ? null : event.clipboardData;
  if (
    data &&
    doPaste(view, data.getData('text/plain'), data.getData('text/html'), event)
  ) {
    event.preventDefault();
  } else {
    capturePaste(view, event);
  }
};

/** 简单的class，只定义了2个属性slice/move */
class Dragging {
  constructor(readonly slice: Slice, readonly move: boolean) {}
}

/** 根据操作系统返回字符串 `altKey` 或 `ctrlKey` */
const dragCopyModifier: keyof DragEvent = browser.mac ? 'altKey' : 'ctrlKey';

handlers.dragstart = (view, _event) => {
  const event = _event as DragEvent;
  const mouseDown = view.input.mouseDown;
  if (mouseDown) mouseDown.done();
  if (!event.dataTransfer) return;

  const sel = view.state.selection;
  const pos = sel.empty ? null : view.posAtCoords(eventCoords(event));
  if (
    pos &&
    pos.pos >= sel.from &&
    pos.pos <= (sel instanceof NodeSelection ? sel.to - 1 : sel.to)
  ) {
    // In selection
  } else if (mouseDown && mouseDown.mightDrag) {
    view.dispatch(
      view.state.tr.setSelection(
        NodeSelection.create(view.state.doc, mouseDown.mightDrag.pos),
      ),
    );
  } else if (event.target && (event.target as HTMLElement).nodeType == 1) {
    const desc = view.docView.nearestDesc(event.target as HTMLElement, true);
    if (desc && desc.node!.type.spec.draggable && desc != view.docView)
      view.dispatch(
        view.state.tr.setSelection(
          NodeSelection.create(view.state.doc, desc.posBefore),
        ),
      );
  }
  const slice = view.state.selection.content(),
    { dom, text } = serializeForClipboard(view, slice);
  event.dataTransfer.clearData();
  event.dataTransfer.setData(
    brokenClipboardAPI ? 'Text' : 'text/html',
    dom.innerHTML,
  );
  // See https://github.com/ProseMirror/prosemirror/issues/1156
  event.dataTransfer.effectAllowed = 'copyMove';
  if (!brokenClipboardAPI) event.dataTransfer.setData('text/plain', text);
  view.dragging = new Dragging(slice, !event[dragCopyModifier]);
};

handlers.dragend = (view) => {
  const dragging = view.dragging;
  window.setTimeout(() => {
    if (view.dragging == dragging) view.dragging = null;
  }, 50);
};

editHandlers.dragover = editHandlers.dragenter = (_, e) => e.preventDefault();

editHandlers.drop = (view, _event) => {
  const event = _event as DragEvent;
  const dragging = view.dragging;
  view.dragging = null;

  if (!event.dataTransfer) return;

  const eventPos = view.posAtCoords(eventCoords(event));
  if (!eventPos) return;
  const $mouse = view.state.doc.resolve(eventPos.pos);
  let slice = dragging && dragging.slice;
  if (slice) {
    view.someProp('transformPasted', (f) => {
      slice = f(slice!);
    });
  } else {
    slice = parseFromClipboard(
      view,
      event.dataTransfer.getData(brokenClipboardAPI ? 'Text' : 'text/plain'),
      brokenClipboardAPI ? null : event.dataTransfer.getData('text/html'),
      false,
      $mouse,
    );
  }
  const move = !!(dragging && !event[dragCopyModifier]);
  if (
    view.someProp('handleDrop', (f) =>
      f(view, event, slice || Slice.empty, move),
    )
  ) {
    event.preventDefault();
    return;
  }
  if (!slice) return;

  event.preventDefault();
  let insertPos = slice
    ? dropPoint(view.state.doc, $mouse.pos, slice)
    : $mouse.pos;
  if (insertPos == null) insertPos = $mouse.pos;

  const tr = view.state.tr;
  if (move) tr.deleteSelection();

  const pos = tr.mapping.map(insertPos);
  const isNode =
    slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1;
  const beforeInsert = tr.doc;
  if (isNode) {
    tr.replaceRangeWith(pos, pos, slice.content.firstChild!);
  } else {
    tr.replaceRange(pos, pos, slice);
  }
  if (tr.doc.eq(beforeInsert)) return;

  const $pos = tr.doc.resolve(pos);
  if (
    isNode &&
    NodeSelection.isSelectable(slice.content.firstChild!) &&
    $pos.nodeAfter &&
    $pos.nodeAfter.sameMarkup(slice.content.firstChild!)
  ) {
    tr.setSelection(new NodeSelection($pos));
  } else {
    let end = tr.mapping.map(insertPos);
    tr.mapping.maps[tr.mapping.maps.length - 1].forEach(
      (_from, _to, _newFrom, newTo) => (end = newTo),
    );
    tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(end)));
  }
  view.focus();
  view.dispatch(tr.setMeta('uiEvent', 'drop'));
};

handlers.focus = (view) => {
  view.input.lastFocus = Date.now();
  if (!view.focused) {
    view.domObserver.stop();
    view.dom.classList.add('ProseMirror-focused');
    view.domObserver.start();
    view.focused = true;
    setTimeout(() => {
      if (
        view.docView &&
        view.hasFocus() &&
        !view.domObserver.currentSelection.eq(view.domSelection())
      ) {
        selectionToDOM(view);
      }
    }, 20);
  }
};

handlers.blur = (view, _event) => {
  const event = _event as FocusEvent;
  if (view.focused) {
    view.domObserver.stop();
    view.dom.classList.remove('ProseMirror-focused');
    view.domObserver.start();
    if (
      event.relatedTarget &&
      view.dom.contains(event.relatedTarget as HTMLElement)
    ) {
      view.domObserver.currentSelection.clear();
    }
    view.focused = false;
  }
};

// Make sure all handlers get registered
for (const prop in editHandlers) handlers[prop] = editHandlers[prop];
