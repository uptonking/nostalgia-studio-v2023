import { Mark, type MarkType, type Node, type Slice } from 'prosemirror-model';
import { type Step, Transform } from 'prosemirror-transform';
import { type EditorView } from 'prosemirror-view';

import { type Plugin, type PluginKey } from './plugin';
import { Selection } from './selection';
import { type EditorState } from './state';

/** Commands are functions that take a state and a an optional
 * transaction dispatch function and...
 *
 *  - determine whether they apply to this state
 *  - if not, return false
 *  - if `dispatch` was passed, perform their effect, possibly by
 *    passing a transaction to `dispatch`
 *  - return true
 *
 * In some cases, the editor view is passed as a third argument.
 */
export type Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView,
) => boolean;

const UPDATED_SEL = 1;
const UPDATED_MARKS = 2;
const UPDATED_SCROLL = 4;

/** An editor state transaction, which can be applied to a state to
 * create an updated state.
 * - Use [`EditorState.tr`](#state.EditorState.tr) to create an instance.
 * - Transform看到的是文档的Model，Transaction在Transform的基础上，同时管理当前的编辑状态
 * - Transaction除了处理文档改动之外，还管理selection、当前使用标记集合、还有时间戳等等
 *
 * Transactions track changes to the document (they are a subclass of
 * [`Transform`](#transform.Transform)), but also other state changes,
 * like selection updates and adjustments of the set of [stored
 * marks](#state.EditorState.storedMarks).
 *
 * In addition, you can store metadata properties in a transaction, which are
 *  extra pieces of information that client code or plugins can use to describe
 * what a transaction represents, so that they can update their [own
 * state](#state.StateField) accordingly.
 *
 * The [editor view](#view.EditorView) uses a few metadata properties:
 * it will attach a property `"pointer"` with the value `true` to
 * selection transactions directly caused by mouse or touch input, and
 * a `"uiEvent"` property of that may be `"paste"`, `"cut"`, or `"drop"`.
 */
export class Transaction extends Transform {
  /** The timestamp associated with this transaction, in the same
   * format as `Date.now()`.
   */
  time: number;

  private curSelection: Selection;
  /** The step count for which the current selection is valid. */
  private curSelectionFor = 0;
  /** Bitfield to track which aspects of the state were updated by
   * this transaction.
   */
  private updated = 0;
  /** Object used to store metadata properties for the transaction. */
  private meta: { [name: string]: any } = Object.create(null);

  /** The stored marks set by this transaction, if any. */
  storedMarks: readonly Mark[] | null;

  /// @internal
  constructor(state: EditorState) {
    super(state.doc);
    this.time = Date.now();
    this.curSelection = state.selection;
    this.storedMarks = state.storedMarks;
  }

  /** The transaction's current selection. This defaults to the editor
   * selection [mapped](#state.Selection.map) through the steps in the
   * transaction, but can be overwritten with
   * [`setSelection`](#state.Transaction.setSelection).
   */
  get selection(): Selection {
    if (this.curSelectionFor < this.steps.length) {
      this.curSelection = this.curSelection.map(
        this.doc,
        this.mapping.slice(this.curSelectionFor),
      );
      this.curSelectionFor = this.steps.length;
    }
    return this.curSelection;
  }

  /** Update the transaction's current selection. Will determine the
   * selection that the editor gets when the transaction is applied.
   */
  setSelection(selection: Selection): this {
    if (selection.$from.doc != this.doc)
      throw new RangeError(
        'Selection passed to setSelection must point at the current document',
      );
    this.curSelection = selection;
    this.curSelectionFor = this.steps.length;
    this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
    this.storedMarks = null;
    return this;
  }

  /** Whether the selection was explicitly updated by this transaction. */
  get selectionSet() {
    return (this.updated & UPDATED_SEL) > 0;
  }

  /** Set the current stored marks. */
  setStoredMarks(marks: readonly Mark[] | null): this {
    this.storedMarks = marks;
    this.updated |= UPDATED_MARKS;
    return this;
  }

  /** Make sure the current stored marks or, if that is null, the marks
   * at the selection, match the given set of marks. Does nothing if
   * this is already the case.
   */
  ensureMarks(marks: readonly Mark[]): this {
    if (!Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks))
      this.setStoredMarks(marks);
    return this;
  }

  /** Add a mark to the set of stored marks. */
  addStoredMark(mark: Mark): this {
    return this.ensureMarks(
      mark.addToSet(this.storedMarks || this.selection.$head.marks()),
    );
  }

  /** Remove a mark or mark type from the set of stored marks. */
  removeStoredMark(mark: Mark | MarkType): this {
    return this.ensureMarks(
      mark.removeFromSet(this.storedMarks || this.selection.$head.marks()),
    );
  }

  /** Whether the stored marks were explicitly set for this transaction. */
  get storedMarksSet() {
    return (this.updated & UPDATED_MARKS) > 0;
  }

  /// @internal
  addStep(step: Step, doc: Node) {
    super.addStep(step, doc);
    this.updated = this.updated & ~UPDATED_MARKS;
    this.storedMarks = null;
  }

  /** Update the timestamp for the transaction. */
  setTime(time: number): this {
    this.time = time;
    return this;
  }

  /** Replace the current selection with the given slice. */
  replaceSelection(slice: Slice): this {
    this.selection.replace(this, slice);
    return this;
  }

  /** Replace the selection with the given node. When `inheritMarks` is
   * true and the content is inline, it inherits the marks from the
   * place where it is inserted.
   */
  replaceSelectionWith(node: Node, inheritMarks = true): this {
    const selection = this.selection;
    if (inheritMarks)
      node = node.mark(
        this.storedMarks ||
          (selection.empty
            ? selection.$from.marks()
            : selection.$from.marksAcross(selection.$to) || Mark.none),
      );
    selection.replaceWith(this, node);
    return this;
  }

  /** Delete the selection. */
  deleteSelection(): this {
    this.selection.replace(this);
    return this;
  }

  /** Replace the given range, or the selection if no range is given,
   * with a text node containing the given string.
   * - 在当前位置插入或者选中位置插入，插入的逻辑就是替换当前选中的内容，还有一些处理就是继承插入位置的 mark 属性，插入后选区的位置处理等
   */
  insertText(text: string, from?: number, to?: number): this {
    const schema = this.doc.type.schema;
    if (from == null) {
      if (!text) return this.deleteSelection();
      // 👉🏻 替换选区内容，最终会执行 tr.replaceRangeWith()
      return this.replaceSelectionWith(schema.text(text), true);
    } else {
      if (to == null) to = from;
      to = to == null ? from : to;
      if (!text) return this.deleteRange(from, to);
      let marks = this.storedMarks;
      if (!marks) {
        const $from = this.doc.resolve(from);
        marks =
          to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
      }
      // 👉🏻 最终会执行 tr.replaceRange()
      this.replaceRangeWith(from, to, schema.text(text, marks));
      if (!this.selection.empty) {
        this.setSelection(Selection.near(this.selection.$to));
      }
      return this;
    }
  }

  /** Store a metadata property in this transaction, keyed either by
   * name or by plugin.
   */
  setMeta(key: string | Plugin | PluginKey, value: any): this {
    this.meta[typeof key === 'string' ? key : key.key] = value;
    return this;
  }

  /** Retrieve a metadata property for a given name or plugin. */
  getMeta(key: string | Plugin | PluginKey) {
    return this.meta[typeof key === 'string' ? key : key.key];
  }

  /** Returns true if this transaction doesn't contain any metadata,
   * and can thus safely be extended.
   */
  get isGeneric() {
    // eslint-disable-next-line no-unreachable-loop
    for (const _ in this.meta) return false;
    return true;
  }

  /** Indicate that the editor should scroll the selection into view
   * when updated to the state produced by this transaction.
   */
  scrollIntoView(): this {
    this.updated |= UPDATED_SCROLL;
    return this;
  }

  /** True when this transaction has had `scrollIntoView` called on it. */
  get scrolledIntoView() {
    return (this.updated & UPDATED_SCROLL) > 0;
  }
}
