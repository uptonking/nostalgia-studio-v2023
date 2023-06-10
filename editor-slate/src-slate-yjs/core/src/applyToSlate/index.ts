import { Editor, type Operation } from 'slate';
import * as Y from 'yjs';

import { translateYTextEvent } from './textEvent';

/**
 * Translate a yjs YTextEvent into slate operations. The editor state has to match the
 * yText state before the event occurred.
 *
 * @param sharedType
 * @param op
 */
export function translateYjsEvent(
  sharedRoot: Y.XmlText,
  editor: Editor,
  // @ts-expect-error fix-types
  event: Y.YEvent<Y.XmlText>,
): Operation[] {
  if (event instanceof Y.YTextEvent) {
    return translateYTextEvent(sharedRoot, editor, event);
  }

  throw new Error('Unexpected Y event type');
}

/**
 * Translates yjs events into slate operations and applies them to the editor.
 * - The editor state has to match the yText state before the events occurred.
 *
 */
export function applyYjsEvents(
  sharedRoot: Y.XmlText,
  editor: Editor,
  // @ts-expect-error fix-types
  events: Y.YEvent<Y.XmlText>[],
) {
  Editor.withoutNormalizing(editor, () => {
    // console.log(';; yEvents ', events);
    events.forEach((event) => {
      const slateOps = translateYjsEvent(sharedRoot, editor, event);
      slateOps.forEach((op) => {
        editor.apply(op);
      });
    });
  });
}
