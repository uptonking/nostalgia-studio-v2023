import {
  type BaseEditor,
  type Descendant,
  Editor,
  type Operation,
  type Point,
} from 'slate';
import * as Y from 'yjs';

import { applyYjsEvents } from '../applyToSlate';
import { applySlateOp } from '../applyToYjs';
import { yTextToSlateElement } from '../utils/convert';
import {
  getStoredPosition,
  getStoredPositions,
  relativePositionToSlatePoint,
  removeStoredPosition,
  setStoredPosition,
  slatePointToRelativePosition,
} from '../utils/position';
import { assertDocumentAttachment } from '../utils/yjs';

type LocalChange = {
  op: Operation;
  doc: Descendant[];
  origin: unknown;
};

const DEFAULT_LOCAL_ORIGIN = 'slate-yjs-operation';
const DEFAULT_POSITION_STORAGE_ORIGIN = 'slate-yjs-position-storage';

const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();
const LOCAL_CHANGES: WeakMap<Editor, LocalChange[]> = new WeakMap();
const CONNECTED: WeakSet<Editor> = new WeakSet();

export type YjsEditor = BaseEditor & {
  sharedRoot: Y.XmlText;
  id: string;

  localOrigin: unknown;
  positionStorageOrigin: unknown;

  /** convert yOp to slateOp, and apply to slate editor */
  // @ts-expect-error fix-types
  applyRemoteEvents: (events: Y.YEvent<Y.XmlText>[], origin: unknown) => void;

  storeLocalChange: (op: Operation) => void;
  getLocalChanges: () => LocalChange[];
  flushLocalChanges: () => void;

  isLocalOrigin: (origin: unknown) => boolean;
  /** listen to changes from yjs-delta with observeDeep, then editor.onChange */
  connect: () => void;

  disconnect: () => void;
};

export const YjsEditor = {
  isYjsEditor(value: unknown): value is YjsEditor {
    return (
      Editor.isEditor(value) &&
      (value as YjsEditor).sharedRoot instanceof Y.XmlText &&
      'localOrigin' in value &&
      'positionStorageOrigin' in value &&
      typeof (value as YjsEditor).applyRemoteEvents === 'function' &&
      typeof (value as YjsEditor).storeLocalChange === 'function' &&
      typeof (value as YjsEditor).flushLocalChanges === 'function' &&
      typeof (value as YjsEditor).isLocalOrigin === 'function' &&
      typeof (value as YjsEditor).connect === 'function' &&
      typeof (value as YjsEditor).disconnect === 'function'
    );
  },

  localChanges(editor: YjsEditor): LocalChange[] {
    return LOCAL_CHANGES.get(editor) ?? [];
  },

  applyRemoteEvents(
    editor: YjsEditor,
    // @ts-expect-error fix-types
    events: Y.YEvent<Y.XmlText>[],
    origin: unknown,
  ): void {
    editor.applyRemoteEvents(events, origin);
  },

  storeLocalChange(editor: YjsEditor, op: Operation): void {
    editor.storeLocalChange(op);
  },

  flushLocalChanges(editor: YjsEditor): void {
    editor.flushLocalChanges();
  },

  connected(editor: YjsEditor): boolean {
    return CONNECTED.has(editor);
  },

  connect(editor: YjsEditor): void {
    editor.connect();
  },

  disconnect(editor: YjsEditor): void {
    editor.disconnect();
  },

  isLocal(editor: YjsEditor): boolean {
    return editor.isLocalOrigin(YjsEditor.origin(editor));
  },

  origin(editor: YjsEditor): unknown {
    const origin = ORIGIN.get(editor);
    return origin !== undefined ? origin : editor.localOrigin;
  },

  /** exec `fn` with `origin` */
  withOrigin(editor: YjsEditor, origin: unknown, fn: () => void): void {
    const prev = YjsEditor.origin(editor);
    ORIGIN.set(editor, origin);
    fn();
    ORIGIN.set(editor, prev);
  },

  storePosition(editor: YjsEditor, key: string, point: Point): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    const position = slatePointToRelativePosition(sharedRoot, editor, point);

    sharedRoot.doc.transact(() => {
      // 👇🏻 stored position is set as attribute on sharedRoot
      setStoredPosition(sharedRoot, key, position);
    }, locationStorageOrigin);
  },

  removeStoredPosition(editor: YjsEditor, key: string): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    sharedRoot.doc.transact(() => {
      removeStoredPosition(sharedRoot, key);
    }, locationStorageOrigin);
  },

  position(editor: YjsEditor, key: string): Point | null | undefined {
    const position = getStoredPosition(editor.sharedRoot, key);
    if (!position) {
      return undefined;
    }

    return relativePositionToSlatePoint(editor.sharedRoot, editor, position);
  },

  storedPositionsRelative(
    editor: YjsEditor,
  ): Record<string, Y.RelativePosition> {
    return getStoredPositions(editor.sharedRoot);
  },
};

export type WithYjsOptions = {
  autoConnect?: boolean;
  /** Origin used when applying local slate operations to yjs */
  localOrigin?: unknown;
  /** Origin used when storing positions */
  positionStorageOrigin?: unknown;
  /** allow to disable listening to remote changes */
  shouldObserveYEvent?: boolean;
  /** used to identify editor in current session  */
  id?: string;
};

export function withYjs<T extends Editor>(
  editor: T,
  sharedRoot: Y.XmlText,
  {
    localOrigin,
    positionStorageOrigin,
    id,
    autoConnect = false,
    shouldObserveYEvent = true,
  }: WithYjsOptions = {},
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedRoot = sharedRoot;
  // todo auto create id
  e.id = id || 'eid' + new Date().toISOString();
  // console.log(';; editor.id ', e.id);

  e.localOrigin = localOrigin ?? e.id + '-' + DEFAULT_LOCAL_ORIGIN;
  e.positionStorageOrigin =
    positionStorageOrigin ?? DEFAULT_POSITION_STORAGE_ORIGIN;

  // yOp to slateOp, then apply to slateDoc
  e.applyRemoteEvents = (events, origin) => {
    YjsEditor.flushLocalChanges(e);

    Editor.withoutNormalizing(e, () => {
      YjsEditor.withOrigin(e, origin, () => {
        applyYjsEvents(e.sharedRoot, e, events);
      });
    });
  };

  e.isLocalOrigin = (origin) => origin === e.localOrigin;

  /**
   * ignore local yop; convert yOp to slateOp, and apply to slate editor
   */
  const handleYEvents = (
    // @ts-expect-error fix-types
    events: Y.YEvent<Y.XmlText>[],
    transaction: Y.Transaction,
  ) => {
    if (e.isLocalOrigin(transaction.origin)) {
      return;
    }
    // console.log(';; y-observeDeep ', events);

    YjsEditor.applyRemoteEvents(e, events, transaction.origin);
  };

  let autoConnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  if (autoConnect) {
    autoConnectTimeoutId = setTimeout(() => {
      autoConnectTimeoutId = null;
      YjsEditor.connect(e);
    });
  }

  e.connect = () => {
    const isConnected = YjsEditor.connected(e);
    if (isConnected) {
      throw new Error('already connected');
    }

    if (shouldObserveYEvent) {
      // after updated, then change events emits to here
      e.sharedRoot.observeDeep(handleYEvents);
    }
    const content = yTextToSlateElement(e.sharedRoot);
    e.children = content.children;

    CONNECTED.add(e);

    Editor.normalize(editor, { force: true });
    if (!editor.operations.length) {
      editor.onChange();
    }
  };

  e.disconnect = () => {
    if (autoConnectTimeoutId) {
      clearTimeout(autoConnectTimeoutId);
    }

    YjsEditor.flushLocalChanges(e);
    e.sharedRoot.unobserveDeep(handleYEvents);
    CONNECTED.delete(e);
  };

  e.storeLocalChange = (op) => {
    LOCAL_CHANGES.set(e, [
      ...YjsEditor.localChanges(e),
      { op, doc: editor.children, origin: YjsEditor.origin(e) },
    ]);
  };

  e.getLocalChanges = () => LOCAL_CHANGES.get(e);

  /**  apply slateOp to ydoc */
  e.flushLocalChanges = () => {
    assertDocumentAttachment(e.sharedRoot);
    const localChanges = YjsEditor.localChanges(e);
    LOCAL_CHANGES.delete(e);

    // Group local changes by origin so we can apply them in the correct order
    // with the correct origin with a minimal amount of transactions.
    const txGroups: LocalChange[][] = [];
    localChanges.forEach((change) => {
      const currentGroup = txGroups[txGroups.length - 1];
      if (currentGroup && currentGroup[0].origin === change.origin) {
        return currentGroup.push(change);
      }
      txGroups.push([change]);
    });

    txGroups.forEach((txGroup) => {
      assertDocumentAttachment(e.sharedRoot);

      e.sharedRoot.doc.transact(() => {
        txGroup.forEach((change) => {
          assertDocumentAttachment(e.sharedRoot);
          // 💡 apply slateOp to ydoc
          applySlateOp(e.sharedRoot, { children: change.doc }, change.op);
        });
      }, txGroup[0].origin);
    });
  };

  const { apply, onChange } = e;

  // 在slateOp执行前，将其保存到本地缓存
  e.apply = (op) => {
    if (YjsEditor.connected(e) && YjsEditor.isLocal(e)) {
      YjsEditor.storeLocalChange(e, op);
    }
    apply(op);
  };

  // 在slateOp执行后，从本地缓存删除，将slateOp转换后apply到ytext
  e.onChange = () => {
    if (YjsEditor.connected(e)) {
      YjsEditor.flushLocalChanges(e);
    }
    onChange();
  };

  return e;
}
