import { Editor, Node, Range, Transforms } from 'slate';

import { isNullOrUndefined } from '../../utils';
import type { AutoformatRule } from './types';
import { getMatchRange, getRangeFromBlockStart, getText } from './utils';

/**
 * Enables support for autoformatting actions.
 * - Once a match rule is validated, it does not check the following rules.
 */
export const withAutoformat =
  (rules: AutoformatRule[] = []) =>
    (editor: Editor) => {
      const { insertText } = editor;

      editor.insertText = (text) => {
        if (editor.selection && !Range.isCollapsed(editor.selection)) {
          return insertText(text);
        }

        for (const rule of rules) {
          const { mode = 'text', insertTrigger, query } = rule;

          // if (query && !query(editor, { ...rule, text })) continue;

          const formatter = {
            block: autoformatBlock,
          };

          if (formatter[mode]?.(editor, {
            ...(rule as any),
            text,
          })) {
            return;
          }
        }

        insertText(text);
      };

      return editor;
    };

const autoformatBlock = (
  editor: Editor,
  { text, type, match, format, mode }: any = {},
) => {
  if (mode === 'block' && isNullOrUndefined(match)) return undefined;

  const matches = Array.isArray(match) ? match : [match];

  for (const match of matches) {
    const { end, triggers } = getMatchRange({
      match: { start: '', end: match },
    });

    if (!triggers.includes(text)) continue;

    let matchRange: Range | undefined;
    matchRange = getRangeFromBlockStart(editor);

    // todo Don't autoformat if there is void nodes.

    const textFromBlockStart = getText(editor, matchRange);

    // if (match === '- ') {
    //   console.log(';; end,matchRange', end, textFromBlockStart, matchRange)
    // }

    if (end !== textFromBlockStart) continue;

    Transforms.delete(editor, { at: matchRange });

    if (!format) {
      Transforms.setNodes<Node & { type: string }>(
        editor,
        { type },
        {
          match: (n) => Editor.isBlock(editor, n),
        },
      );
    } else {
      format(editor);
    }

    return true;
  }

  return false;
};
