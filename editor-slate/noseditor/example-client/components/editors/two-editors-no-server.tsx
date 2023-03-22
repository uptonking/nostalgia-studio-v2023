import './two-editors.scss';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import {
  createEditor,
  type Descendant,
  Editor,
  Node as SlateNode,
  Range,
  Transforms,
} from 'slate';
import { DefaultEditable as Editable, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';

import {
  slateNodesToInsertDelta,
  withYHistory,
  withYjs,
  YjsEditor,
} from '@slate-yjs/core';

const initialValue = [
  {
    type: 'p',
    children: [
      { text: 'Hello, test paragraph. 测试yjs管理数据，暂未实现协同。' },
    ],
  },
] as unknown as SlateNode[];

export type EditClientType = {
  siteId: string;
  isOnline: boolean;
  editor?: YjsEditor;
  onSelect?: (siteId: string, range: number) => void;
};

/**
 * show two editors on the same page to mock collab.
 * - all changes are synced simultaneously.
 */
export const TwoEditorsCollabNoServer = () => {
  const [client1, setClient1] = useState<EditClientType>({
    siteId: 'alice',
    isOnline: true,
  });
  const [client2, setClient2] = useState<EditClientType>({
    siteId: 'bob',
    isOnline: true,
  });

  useEffect(() => {
    /**
     */
    const handleYEvents =
      (editor: YjsEditor) =>
        (
          // @ts-expect-error fix-types
          events: Y.YEvent<Y.XmlText>[],
          transaction: Y.Transaction,
        ) => {
          // console.log(
          //   ';; y-observeDeep ',
          //   editor.isLocalOrigin(transaction.origin),
          //   transaction.origin,
          //   events,
          // );
          if (editor.isLocalOrigin(transaction.origin)) {
            return;
          }
          YjsEditor.applyRemoteEvents(editor, events, transaction.origin);
        };

    if (client1?.editor?.sharedRoot && client2?.editor?.sharedRoot) {
      //   client1.editor.ydoc.on('update', (update) => {
      //     console.log(';; ydoc c1 to c2');
      //     Y.applyUpdate(client2.editor.ydoc, update);
      //   });
      //   client2.editor.ydoc.on('update', (update) => {
      //     console.log(';; ydoc c2 to c1');
      //     Y.applyUpdate(client1.editor.ydoc, update);
      //   });

      const handle1 = handleYEvents(client2.editor);
      const handle2 = handleYEvents(client1.editor);

      // client1.editor.sharedRoot.observeDeep(handle1);
      // client2.editor.sharedRoot.observeDeep(handle2);

      return () => {
        if (handle1 && handle2) {
          client1.editor.sharedRoot.unobserveDeep(handle1);
          client2.editor.sharedRoot.unobserveDeep(handle2);
        }
      };
    }
  }, [client1, client1?.editor, client2?.editor]);

  const updateSelection = (
    fromIndex: number,
    toIndex: number,
    from: EditClientType,
    to: EditClientType,
  ) => {
    // to.onSelect &&
    //   to.onSelect(fromIndex, toIndex - fromIndex, from.siteId);
  };

  return (
    <div className='collab-app'>
      <div className='main'>
        <div className='editor-client'>
          <div className='header'>
            <h2>{client1.siteId}</h2>
            <button
              className={`btn ${client1.isOnline ? 'online' : 'offline'}`}
            // onClick={() => toggleOnline(siteA, setSiteA, siteB)}
            >
              {client1.isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          <div className='editor-container'>
            <CollabEditor
              clientData={client1}
              setClientData={useCallback(
                (
                  editor: YjsEditor,
                  onSelect?: (siteId: string, range: number) => void,
                ) => {
                  setClient1({ ...client1, editor, onSelect });
                },
                [client1],
              )}
            // updateContentListener={(payload: any) =>
            //   updateEditorContent(payload, client1, client2)
            // }
            // updateSelection={(fromIndex: number, toIndex: number) =>
            //   updateSelection(fromIndex, toIndex, siteA, siteB)
            // }
            />
          </div>
        </div>

        <div className='editor-client'>
          <div className='header'>
            <h2>{client2.siteId}</h2>
            <button
              className={`btn ${client2.isOnline ? 'online' : 'offline'}`}
            // onClick={() => toggleOnline(siteA, setSiteA, siteB)}
            >
              {client2.isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          <div className='editor-container'>
            <CollabEditor
              clientData={client2}
              setClientData={useCallback(
                (
                  editor: YjsEditor,
                  onSelect?: (siteId: string, range: number) => void,
                ) => {
                  setClient2({ ...client2, editor, onSelect });
                },
                [client2],
              )}
            // updateContentListener={(payload: any) =>
            //   updateEditorContent(payload, client2, client1)
            // }
            // updateSelection={(fromIndex: number, toIndex: number) =>
            //   updateSelection(fromIndex, toIndex, siteA, siteB)
            // }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export type CollabEditorProps = {
  clientData: EditClientType;
  setClientData: (
    e: YjsEditor,
    onSelect?: (siteId: string, range: number) => void,
  ) => void;
};

const CollabEditor = ({ clientData, setClientData }: CollabEditorProps) => {
  // Create a yjs document and get the shared type; Setup the binding
  useEffect(() => {
    // console.log(';; creating sla-editor', !clientData.editor);
    if (!clientData.editor) {
      const yDoc = new Y.Doc();
      const sharedType = yDoc.get('content', Y.XmlText);
      // Load the initial value into the yjs document
      sharedType.applyDelta(slateNodesToInsertDelta(initialValue));
      const editor = withReact(
        withYHistory(
          withYjs(createEditor(), sharedType, {
            shouldObserveYEvent: false,
            id: clientData.siteId,
          }),
        ),
      );

      // Ensure editor always has at least 1 valid child
      const { normalizeNode } = editor;
      editor.normalizeNode = (entry) => {
        const [node] = entry;
        if (!Editor.isEditor(node) || node.children.length > 0) {
          return normalizeNode(entry);
        }

        Transforms.insertNodes(
          editor,
          {
            type: 'p',
            children: [{ text: '' }],
          },
          { at: [0] },
        );
      };
      editor['id'] = clientData.siteId;
      editor['ydoc'] = yDoc;
      setClientData(editor);
    }
    window[clientData.siteId] = clientData.editor;
    // window['ydoc'] = clientData.editor?.sharedRoot;
  }, [clientData.editor, clientData.siteId, setClientData]);

  // Connect editor in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    if (clientData.editor) {
      YjsEditor.connect(clientData.editor);
      return () => YjsEditor.disconnect(clientData.editor);
    }
  }, [clientData.editor]);

  return clientData.editor ? (
    <Slate editor={clientData.editor as any} value={[]}>
      <Editable
      // onClick={() =>
      //   console.log(
      //     ';; ed-sel-start ',
      //     clientData.editor.selection.anchor,
      //     Range.isCollapsed(clientData.editor.selection),
      //   )
      // }
      />
    </Slate>
  ) : null;
};
