import { type Editor } from 'codemirror';

import { Range, Selection } from './selection';
import { TextOperation } from './text-operation';

const addedCssRules = {};
let styleSheet: CSSStyleSheet;

const addStyleRule = (css: string) => {
  if (addedCssRules[css]) {
    return;
  }
  if (!styleSheet) {
    const htmlStyleElement = document.createElement('style');
    document.documentElement
      .getElementsByTagName('head')[0]
      .appendChild(htmlStyleElement);
    styleSheet = htmlStyleElement.sheet;
  }
  addedCssRules[css] = true;
  styleSheet.insertRule(css, (styleSheet.cssRules || styleSheet.rules).length);
};

/**
 * CodeMirror changes <--> 自定义text-operations
 */
export class CodeMirror5Adapter {
  cm: Editor;
  ignoreNextChange: boolean;
  changeInProgress: boolean;
  selectionChanged: boolean;
  callbacks: Record<string, (...args: any[]) => void>;

  constructor(cm: Editor) {
    this.cm = cm;
    this.ignoreNextChange = false;
    this.changeInProgress = false;
    this.selectionChanged = false;

    this.onChange = this.onChange.bind(this);
    this.onChanges = this.onChanges.bind(this);
    this.onCursorActivity = this.onCursorActivity.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    cm.on('changes', this.onChanges);
    cm.on('change', this.onChange);
    cm.on('cursorActivity', this.onCursorActivity);
    cm.on('focus', this.onFocus);
    cm.on('blur', this.onBlur);
  }

  detach() {
    this.cm.off('changes', this.onChanges);
    this.cm.off('change', this.onChange);
    this.cm.off('cursorActivity', this.onCursorActivity);
    this.cm.off('focus', this.onFocus);
    this.cm.off('blur', this.onBlur);
  }

  /** 简单执行 `this.changeInProgress = true;` */
  onChange() {
    // By default, CodeMirror's event order is the following:
    // 1. 'change', 2. 'cursorActivity', 3. 'changes'.
    // We want to fire the 'selectionChange' event after the 'change' event,
    // but need the information from the 'changes' event. Therefore, we detect
    // when a change is in progress by listening to the change event, setting
    // a flag that makes this adapter defer all 'cursorActivity' events.
    this.changeInProgress = true;
  }

  /**
   * 从codemirror内容的变化计算出TextOperation，再执行外部注册的change/selectionChange
   * @param _
   * @param changes CodeMirror changeObj array {from, to, text, removed, origin}[]
   */
  onChanges(_, changes) {
    console.log('cm-changes ->', changes);
    if (!this.ignoreNextChange) {
      const pair = CodeMirror5Adapter.operationFromCodeMirrorChanges(
        changes,
        this.cm,
      );
      // [operation, inverse]
      this.trigger('change', pair[0], pair[1]);
    }

    if (this.selectionChanged) {
      this.trigger('selectionChange');
    }
    this.changeInProgress = false;
    this.ignoreNextChange = false;
  }

  onFocus() {
    if (this.changeInProgress) {
      this.selectionChanged = true;
    } else {
      this.trigger('selectionChange');
    }
  }

  onCursorActivity() {
    this.onFocus();
  }

  onBlur() {
    if (!this.cm.somethingSelected()) {
      this.trigger('blur');
    }
  }

  getValue() {
    return this.cm.getValue();
  }

  /** 根据cm选区计算自定义选区对象 */
  getSelection() {
    const cm = this.cm;

    const selectionList = cm.listSelections();
    const ranges = [];
    for (let i = 0; i < selectionList.length; i++) {
      ranges[i] = new Range(
        cm.indexFromPos(selectionList[i].anchor),
        cm.indexFromPos(selectionList[i].head),
      );
    }

    return new Selection(ranges);
  }

  setSelection(selection: Selection) {
    const ranges = [];
    for (let i = 0; i < selection.ranges.length; i++) {
      const range = selection.ranges[i];
      ranges[i] = {
        anchor: this.cm.posFromIndex(range.anchor),
        head: this.cm.posFromIndex(range.head),
      };
    }
    this.cm.setSelections(ranges);
  }

  setOtherCursor(position, color, clientId) {
    const cursorPos = this.cm.posFromIndex(position);
    const cursorCoords = this.cm.cursorCoords(cursorPos);
    const cursorEl = document.createElement('span');
    cursorEl.className = 'other-client';
    cursorEl.style.display = 'inline-block';
    cursorEl.style.padding = '0';
    cursorEl.style.marginLeft = cursorEl.style.marginRight = '-1px';
    cursorEl.style.borderLeftWidth = '2px';
    cursorEl.style.borderLeftStyle = 'solid';
    cursorEl.style.borderLeftColor = color;
    cursorEl.style.height =
      (cursorCoords.bottom - cursorCoords.top) * 0.9 + 'px';
    // cursorEl.style.zIndex = 0;
    cursorEl.style.zIndex = '0';
    cursorEl.setAttribute('data-clientid', clientId);
    return this.cm.setBookmark(cursorPos, {
      widget: cursorEl,
      insertLeft: true,
    });
  }

  setOtherSelectionRange(range, color, clientId) {
    const match = /^#([0-9a-fA-F]{6})$/.exec(color);
    if (!match) {
      throw new Error('only six-digit hex colors are allowed.');
    }
    const selectionClassName = 'selection-' + match[1];
    const rule = '.' + selectionClassName + ' { background: ' + color + '; }';
    addStyleRule(rule);

    const anchorPos = this.cm.posFromIndex(range.anchor);
    const headPos = this.cm.posFromIndex(range.head);

    return this.cm.markText(
      minPos(anchorPos, headPos),
      maxPos(anchorPos, headPos),
      { className: selectionClassName },
    );
  }

  setOtherSelection(selection, color, clientId) {
    const selectionObjects = [];
    for (let i = 0; i < selection.ranges.length; i++) {
      const range = selection.ranges[i];
      if (range.isEmpty()) {
        selectionObjects[i] = this.setOtherCursor(range.head, color, clientId);
      } else {
        selectionObjects[i] = this.setOtherSelectionRange(
          range,
          color,
          clientId,
        );
      }
    }
    return {
      clear: () => {
        for (let i = 0; i < selectionObjects.length; i++) {
          selectionObjects[i].clear();
        }
      },
    };
  }

  /** 调用 CodeMirror5Adapter.applyOperationToCodeMirror */
  applyOperation(operation) {
    this.ignoreNextChange = true;
    CodeMirror5Adapter.applyOperationToCodeMirror(operation, this.cm);
  }

  registerUndo(undoFn) {
    this.cm.undo = undoFn;
  }

  registerRedo(redoFn) {
    this.cm.redo = redoFn;
  }

  /** 注册cb到当前类，缺点是只能注册一次，不能添加、删除、修改 */
  registerCallbacks(cb: Record<string, (...args: any[]) => void>) {
    this.callbacks = cb;
  }

  // trigger(event, ...rest) {
  //   const args = Array.prototype.slice.call(arguments, 1);
  //   const action = this.callbacks && this.callbacks[event];
  //   if (action) {
  //     action.apply(this, args);
  //   }
  // }

  trigger(event: string, ...restArgs: any[]) {
    const cb = this.callbacks && this.callbacks[event];
    if (cb) {
      cb.apply(this, restArgs);
    }
  }

  /** Converts a CodeMirror change array ( from 'changes' event ) or single change
   * or linked list of changes (as returned by the 'change' event in CodeMirror prior to v4)
   * into a TextOperation and its inverse, and returns them as a two-element array.
   */
  static operationFromCodeMirrorChanges(
    changes: any[],
    doc: Editor,
  ): [TextOperation, TextOperation] {
    // Approach: Replay the changes, beginning with the most recent one, and
    // construct the operation and its inverse. We have to convert the position
    // in the pre-change coordinate system to an index. We have a method to
    // convert a position in the coordinate system after all changes to an index,
    // namely CodeMirror's `indexFromPos` method. We can use the information of
    // a single change object to convert a post-change coordinate system to a
    // pre-change coordinate system. We can now proceed inductively to get a
    // pre-change coordinate system for all changes in the linked list.
    // A disadvantage of this approach is its complexity `O(n^2)` in the length
    // of the linked list of changes.

    let docEndLength = codemirrorDocLength(doc);
    let operation = new TextOperation().retain(docEndLength);
    let inverse = new TextOperation().retain(docEndLength);

    let indexFromPos = (pos) => doc.indexFromPos(pos);

    const last = (arr) => arr[arr.length - 1];

    function sumLengths(strArr: string[]) {
      if (strArr.length === 0) {
        return 0;
      }
      let sum = 0;
      for (let i = 0; i < strArr.length; i++) {
        sum += strArr[i].length;
      }
      return sum + strArr.length - 1; // ❓ 为什么减一
    }

    function updateIndexFromPos(indexFromPos, change) {
      return function (pos) {
        if (posLe(pos, change.from)) {
          return indexFromPos(pos);
        }
        if (posLe(change.to, pos)) {
          return (
            indexFromPos({
              line:
                pos.line +
                change.text.length -
                1 -
                (change.to.line - change.from.line),
              ch:
                change.to.line < pos.line
                  ? pos.ch
                  : change.text.length <= 1
                    ? pos.ch -
                      (change.to.ch - change.from.ch) +
                      sumLengths(change.text)
                    : pos.ch - change.to.ch + last(change.text).length,
            }) +
            sumLengths(change.removed) -
            sumLengths(change.text)
          );
        }
        if (change.from.line === pos.line) {
          return indexFromPos(change.from) + pos.ch - change.from.ch;
        }
        return (
          indexFromPos(change.from) +
          sumLengths(change.removed.slice(0, pos.line - change.from.line)) +
          1 +
          pos.ch
        );
      };
    }

    for (let i = changes.length - 1; i >= 0; i--) {
      const change = changes[i];
      indexFromPos = updateIndexFromPos(indexFromPos, change);
      // change后光标停留的位置
      const fromIndex = indexFromPos(change.from);
      // change后光标停留的位置距离文档最后还有多少length
      const restLength = docEndLength - fromIndex - sumLengths(change.text);

      operation = new TextOperation()
        .retain(fromIndex)
        .delete(sumLengths(change.removed))
        .insert(change.text.join('\n'))
        .retain(restLength)
        .compose(operation);

      inverse = inverse.compose(
        new TextOperation()
          .retain(fromIndex)
          .delete(sumLengths(change.text))
          .insert(change.removed.join('\n'))
          .retain(restLength),
      );

      docEndLength += sumLengths(change.removed) - sumLengths(change.text);
    }

    return [operation, inverse];
  }
  // ---- end for operationFromCodeMirrorChanges

  /** Singular form for backwards compatibility */
  static operationFromCodeMirrorChange(changes, doc) {
    CodeMirror5Adapter.operationFromCodeMirrorChanges(changes, doc);
  }

  /** Apply an operation to a CodeMirror instance.
   */
  static applyOperationToCodeMirror(operation, cm) {
    cm.operation(function () {
      const ops = operation.ops;
      let index = 0; // holds the current index into CodeMirror's content
      for (let i = 0, l = ops.length; i < l; i++) {
        const op = ops[i];
        if (TextOperation.isRetain(op)) {
          index += op;
        } else if (TextOperation.isInsert(op)) {
          cm.replaceRange(op, cm.posFromIndex(index));
          index += op.length;
        } else if (TextOperation.isDelete(op)) {
          const from = cm.posFromIndex(index);
          const to = cm.posFromIndex(index - op);
          cm.replaceRange('', from, to);
        }
      }
    });
  }
}

function cmpPos(a, b) {
  if (a.line < b.line) {
    return -1;
  }
  if (a.line > b.line) {
    return 1;
  }
  if (a.ch < b.ch) {
    return -1;
  }
  if (a.ch > b.ch) {
    return 1;
  }
  return 0;
}
function posEq(a, b) {
  return cmpPos(a, b) === 0;
}
function posLe(a, b) {
  return cmpPos(a, b) <= 0;
}

function minPos(a, b) {
  return posLe(a, b) ? a : b;
}
function maxPos(a, b) {
  return posLe(a, b) ? b : a;
}

function codemirrorDocLength(doc: Editor) {
  return (
    doc.indexFromPos({ line: doc.lastLine(), ch: 0 }) +
    doc.getLine(doc.lastLine()).length
  );
}
