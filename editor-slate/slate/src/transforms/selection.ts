import { MoveUnit, SelectionEdge } from '../interfaces/types';
import { Editor, Location, Point, Range, Transforms } from '..';

export interface SelectionCollapseOptions {
  edge?: SelectionEdge;
}

export interface SelectionMoveOptions {
  distance?: number;
  unit?: MoveUnit;
  reverse?: boolean;
  edge?: SelectionEdge;
}

export interface SelectionSetPointOptions {
  edge?: SelectionEdge;
}

export interface SelectionTransforms {
  /** Collapse the selection to a single point. */
  collapse: (editor: Editor, options?: SelectionCollapseOptions) => void;
  /** Move the selection's point forward or backward. */
  move: (editor: Editor, options?: SelectionMoveOptions) => void;
  /** Set the selection to a new value specified by target. When a selection already exists, this method is just a proxy for setSelection and will update the existing value. */
  select: (editor: Editor, target: Location) => void;
  deselect: (editor: Editor) => void;
  setPoint: (
    editor: Editor,
    props: Partial<Point>,
    options?: SelectionSetPointOptions,
  ) => void;
  /** - Set new properties on an active selection.
   * - Since the value is a Partial<Range>, this method can only handle updates to an existing selection.
   * - If there is no active selection the operation will be void.
   * - Use `select` if you'd like to create a selection when there is none. */
  setSelection: (editor: Editor, props: Partial<Range>) => void;
}

export const SelectionTransforms: SelectionTransforms = {
  /**
   * Collapse the selection.
   */
  collapse(editor: Editor, options: SelectionCollapseOptions = {}): void {
    const { edge = 'anchor' } = options;
    const { selection } = editor;

    if (!selection) {
      return;
    } else if (edge === 'anchor') {
      Transforms.select(editor, selection.anchor);
    } else if (edge === 'focus') {
      Transforms.select(editor, selection.focus);
    } else if (edge === 'start') {
      const [start] = Range.edges(selection);
      Transforms.select(editor, start);
    } else if (edge === 'end') {
      const [, end] = Range.edges(selection);
      Transforms.select(editor, end);
    }
  },

  /**
   * Unset the selection.
   */

  deselect(editor: Editor): void {
    const { selection } = editor;

    if (selection) {
      editor.apply({
        type: 'set_selection',
        properties: selection,
        newProperties: null,
      });
    }
  },

  /**
   * Move the selection's point forward or backward.
   */

  move(editor: Editor, options: SelectionMoveOptions = {}): void {
    const { selection } = editor;
    const { distance = 1, unit = 'character', reverse = false } = options;
    let { edge = null } = options;

    if (!selection) {
      return;
    }

    if (edge === 'start') {
      edge = Range.isBackward(selection) ? 'focus' : 'anchor';
    }

    if (edge === 'end') {
      edge = Range.isBackward(selection) ? 'anchor' : 'focus';
    }

    const { anchor, focus } = selection;
    const opts = { distance, unit };
    const props: Partial<Range> = {};

    if (edge == null || edge === 'anchor') {
      const point = reverse
        ? Editor.before(editor, anchor, opts)
        : Editor.after(editor, anchor, opts);

      if (point) {
        props.anchor = point;
      }
    }

    if (edge == null || edge === 'focus') {
      const point = reverse
        ? Editor.before(editor, focus, opts)
        : Editor.after(editor, focus, opts);

      if (point) {
        props.focus = point;
      }
    }

    Transforms.setSelection(editor, props);
  },

  /**
   * Set the selection to a new value.
   */

  select(editor: Editor, target: Location): void {
    const { selection } = editor;
    target = Editor.range(editor, target);

    if (selection) {
      Transforms.setSelection(editor, target);
      return;
    }

    if (!Range.isRange(target)) {
      throw new Error(
        `When setting the selection and the current selection is \`null\` you must provide at least an \`anchor\` and \`focus\`, but you passed: ${JSON.stringify(
          target,
        )}`,
      );
    }

    editor.apply({
      type: 'set_selection',
      properties: selection,
      newProperties: target,
    });
  },

  /**
   * Set new properties on one of the selection's points.
   */

  setPoint(
    editor: Editor,
    props: Partial<Point>,
    options: SelectionSetPointOptions = {},
  ): void {
    const { selection } = editor;
    let { edge = 'both' } = options;

    if (!selection) {
      return;
    }

    if (edge === 'start') {
      edge = Range.isBackward(selection) ? 'focus' : 'anchor';
    }

    if (edge === 'end') {
      edge = Range.isBackward(selection) ? 'anchor' : 'focus';
    }

    const { anchor, focus } = selection;
    const point = edge === 'anchor' ? anchor : focus;

    Transforms.setSelection(editor, {
      [edge === 'anchor' ? 'anchor' : 'focus']: { ...point, ...props },
    });
  },

  /**
   * Set new properties on the selection.
   */

  setSelection(editor: Editor, props: Partial<Range>): void {
    const { selection } = editor;
    const oldProps: Partial<Range> | null = {};
    const newProps: Partial<Range> = {};

    if (!selection) {
      return;
    }

    for (const k in props) {
      if (
        (k === 'anchor' &&
          props.anchor != null &&
          !Point.equals(props.anchor, selection.anchor)) ||
        (k === 'focus' &&
          props.focus != null &&
          !Point.equals(props.focus, selection.focus)) ||
        (k !== 'anchor' && k !== 'focus' && props[k] !== selection[k])
      ) {
        oldProps[k] = selection[k];
        newProps[k] = props[k];
      }
    }

    if (Object.keys(oldProps).length > 0) {
      editor.apply({
        type: 'set_selection',
        properties: oldProps,
        newProperties: newProps,
      });
    }
  },
};
