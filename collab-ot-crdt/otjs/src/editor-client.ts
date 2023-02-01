import { AwaitingWithBuffer, OperationClient } from './client';
import { CodeMirror5Adapter } from './codemirror5-adapter';
import { Selection } from './selection';
import { SocketIOAdapter } from './socketio-adapter';
import { TextOperation } from './text-operation';
import { UndoManager } from './undo-manager';
import { WrappedOperation } from './wrapped-operation';

/** 一个operation相关的选区数据 */
class SelfMeta {
  selectionBefore: Selection;
  selectionAfter: Selection;

  constructor(selectionBefore: Selection, selectionAfter: Selection) {
    this.selectionBefore = selectionBefore;
    this.selectionAfter = selectionAfter;
  }

  invert() {
    return new SelfMeta(this.selectionAfter, this.selectionBefore);
  }

  compose(other: SelfMeta) {
    return new SelfMeta(this.selectionBefore, other.selectionAfter);
  }

  /** 执行转换selection */
  transform(operation: TextOperation) {
    return new SelfMeta(
      this.selectionBefore.transform(operation),
      this.selectionAfter.transform(operation),
    );
  }
}

/** 除自己外其他客户端的视图相关的数据，主要是选区 */
class OtherClient {
  /** 当前服务端维持的文本变更版本号（version） */
  id: string;
  listEl: HTMLElement;
  li: HTMLLIElement;
  editorAdapter: CodeMirror5Adapter;
  name: string;
  hue: string;
  color: string;
  lightColor: string;
  selection: Selection;
  mark: { clear: () => void };

  constructor(
    id: string,
    listEl: HTMLElement,
    editorAdapter: CodeMirror5Adapter,
    name?: string,
    selection?: Selection,
  ) {
    this.id = id;
    this.listEl = listEl;
    this.editorAdapter = editorAdapter;
    this.name = name;

    this.li = document.createElement('li');
    if (name) {
      this.li.textContent = name;
      this.listEl.appendChild(this.li);
    }

    this.setColor(name ? hueFromName(name) : Math.random());
    if (selection) {
      this.updateSelection(selection);
    }
  }

  setColor(hue) {
    this.hue = hue;
    this.color = hsl2hex(hue, 0.75, 0.5);
    this.lightColor = hsl2hex(hue, 0.5, 0.9);
    if (this.li) {
      this.li.style.color = this.color;
    }
  }

  setName(name) {
    if (this.name === name) {
      return;
    }
    this.name = name;

    this.li.textContent = name;
    if (!this.li.parentNode) {
      this.listEl.appendChild(this.li);
    }

    this.setColor(hueFromName(name));
  }

  updateSelection(selection) {
    this.removeSelection();
    this.selection = selection;
    this.mark = this.editorAdapter.setOtherSelection(
      selection,
      selection.position === selection.selectionEnd
        ? this.color
        : this.lightColor,
      this.id,
    );
  }

  remove() {
    if (this.li) {
      removeElement(this.li);
    }
    this.removeSelection();
  }

  removeSelection() {
    if (this.mark) {
      this.mark.clear();
      this.mark = null;
    }
  }
}

/**
 * - 编辑文档的每一个操作对应一次版本号顺序递增，客户端和服务端各自维持一个版本号
 * - 客户端版本号始终小于等于服务端版本号
 * - 注册callbacks到editorAdapter和serverAdapter
 */
export class EditorClient extends OperationClient {
  serverAdapter: SocketIOAdapter;
  editorAdapter: CodeMirror5Adapter;
  undoManager: UndoManager;
  clients: Record<string, OtherClient>;
  /** 显示客户端元数据的dom元素 */
  clientListEl: HTMLElement;
  selection: Selection;

  constructor(
    revision: number,
    clients: Record<string, Record<'selection' | 'name', any>>,
    serverAdapter: SocketIOAdapter,
    editorAdapter: CodeMirror5Adapter,
  ) {
    super(revision);
    this.serverAdapter = serverAdapter;
    this.editorAdapter = editorAdapter;
    this.undoManager = new UndoManager();

    this.initializeClientListView();
    this.initializeClients(clients);

    this.onChange = this.onChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.onClientLeft = this.onClientLeft.bind(this);
    this.getClientObject = this.getClientObject.bind(this);
    this.serverAck = this.serverAck.bind(this);
    this.applyServer = this.applyServer.bind(this);
    this.transformSelection = this.transformSelection.bind(this);
    this.serverReconnect = this.serverReconnect.bind(this);
    this.applyUnRedo = this.applyUnRedo.bind(this);

    // / 会注册到editorAdapter的cb

    this.editorAdapter.registerCallbacks({
      // 本地文本有变更
      change: (operation: TextOperation, inverse: TextOperation) => {
        this.onChange(operation, inverse);
      },
      // 本地光标位置有变更
      selectionChange: () => {
        this.onSelectionChange();
      },
      // 编辑器失焦
      blur: () => {
        this.onBlur();
      },
    });
    this.editorAdapter.registerUndo(() => {
      this.undo();
    });
    this.editorAdapter.registerRedo(() => {
      this.redo();
    });

    // /会注册到serverAdapter的cb

    this.serverAdapter.registerCallbacks({
      client_left: (clientId) => {
        this.onClientLeft(clientId);
      },
      set_name: (clientId, name) => {
        this.getClientObject(clientId).setName(name);
      },
      ack: () => {
        this.serverAck();
      },
      operation: (operation) => {
        // 收到服务端发来的新op
        this.applyServer(TextOperation.fromJSON(operation));
      },
      selection: (clientId, selection) => {
        if (selection) {
          this.getClientObject(clientId).updateSelection(
            this.transformSelection(Selection.fromJSON(selection)),
          );
        } else {
          this.getClientObject(clientId).removeSelection();
        }
      },
      clients: (clients) => {
        let clientId;
        for (clientId in this.clients) {
          if (
            this.clients.hasOwnProperty(clientId) &&
            !clients.hasOwnProperty(clientId)
          ) {
            this.onClientLeft(clientId);
          }
        }

        for (clientId in clients) {
          if (clients.hasOwnProperty(clientId)) {
            const clientObject = this.getClientObject(clientId);

            if (clients[clientId].name) {
              clientObject.setName(clients[clientId].name);
            }

            const selection = clients[clientId].selection;
            if (selection) {
              this.clients[clientId].updateSelection(
                this.transformSelection(Selection.fromJSON(selection)),
              );
            } else {
              this.clients[clientId].removeSelection();
            }
          }
        }
      },
      reconnect: () => {
        this.serverReconnect();
      },
    });
  }

  addClient(
    clientId: string,
    clientObj: { name: string; selection: Selection },
  ) {
    this.clients[clientId] = new OtherClient(
      clientId,
      this.clientListEl,
      this.editorAdapter,
      clientObj.name || clientId,
      clientObj.selection ? Selection.fromJSON(clientObj.selection) : null,
    );
  }

  /** 将clients信息封装成 OtherClient对象 */
  initializeClients(
    clients: Record<string, Record<'selection' | 'name', any>>,
  ) {
    this.clients = {};
    for (const clientId in clients) {
      if (clients.hasOwnProperty(clientId)) {
        this.addClient(clientId, clients[clientId]);
      }
    }
  }

  getClientObject(clientId) {
    const client = this.clients[clientId];
    if (client) {
      return client;
    }
    return (this.clients[clientId] = new OtherClient(
      clientId,
      this.clientListEl,
      this.editorAdapter,
    ));
  }

  // 远端有client链接断开
  onClientLeft(clientId) {
    console.log('User disconnected: ' + clientId);
    const client = this.clients[clientId];
    if (!client) {
      return;
    }
    client.remove();
    delete this.clients[clientId];
  }

  initializeClientListView() {
    this.clientListEl = document.createElement('ul');
  }

  /**  */
  applyUnRedo(operation) {
    this.undoManager.add(
      operation.invert(this.editorAdapter.getValue()),
      undefined,
    );
    this.editorAdapter.applyOperation(operation.wrapped);
    this.selection = operation.meta.selectionAfter;
    this.editorAdapter.setSelection(this.selection);
    this.applyClient(operation.wrapped);
  }

  undo() {
    if (!this.undoManager.canUndo()) {
      return;
    }
    this.undoManager.performUndo((o) => {
      this.applyUnRedo(o);
    });
  }

  redo() {
    if (!this.undoManager.canRedo()) {
      return;
    }
    this.undoManager.performRedo((o) => {
      this.applyUnRedo(o);
    });
  }

  /** 将operation添加到undoManager，根据client状态，可能发送operation到服务端，可能在本地合并op */
  onChange(textOperation: TextOperation, inverse: TextOperation) {
    const selectionBefore = this.selection;
    this.updateSelection();
    // const meta = new SelfMeta(selectionBefore, this.selection);
    // const operation = new WrappedOperation(textOperation, meta);
    const shouldCompose =
      this.undoManager.undoStack.length > 0 &&
      inverse.shouldBeComposedWithInverted(
        getLastElement(this.undoManager.undoStack).wrapped,
      );
    const inverseMeta = new SelfMeta(this.selection, selectionBefore);
    this.undoManager.add(
      new WrappedOperation(inverse, inverseMeta),
      shouldCompose,
    );
    // 根据client的状态，可能将operation发送到服务端，也可能转换状态，可能和本地积压的op合并
    this.applyClient(textOperation);
  }

  /** 根据cm选区计算自定义选区对象 */
  updateSelection() {
    this.selection = this.editorAdapter.getSelection();
  }

  onSelectionChange() {
    const oldSelection = this.selection;
    this.updateSelection();
    if (oldSelection && this.selection.equals(oldSelection)) {
      return;
    }
    this.sendSelection(this.selection);
  }

  onBlur() {
    this.selection = null;
    this.sendSelection(null);
  }

  sendSelection(selection: Selection) {
    if (this.state instanceof AwaitingWithBuffer) {
      return;
    }
    this.serverAdapter.sendSelection(selection);
  }

  /** 实现父类OperationClient定义的方法，发送op到server */
  sendOperation(revision: number, operation: TextOperation) {
    this.serverAdapter.sendOperation(
      revision,
      operation.toJSON(),
      this.selection,
    );
  }

  /** 实现父类OperationClient定义的方法 */
  applyOperation(operation) {
    // 不考虑undo、redo时，服务端发来其他客户端操作oA'是可以直接执行的
    this.editorAdapter.applyOperation(operation);
    this.updateSelection();
    this.undoManager.transform(new WrappedOperation(operation, null));
  }
}

function rgb2hex(r, g, b) {
  function digits(n) {
    const m = Math.round(255 * n).toString(16);
    return m.length === 1 ? '0' + m : m;
  }
  return '#' + digits(r) + digits(g) + digits(b);
}

function hsl2hex(h, s, l) {
  if (s === 0) {
    return rgb2hex(l, l, l);
  }
  const var2 = l < 0.5 ? l * (1 + s) : l + s - s * l;
  const var1 = 2 * l - var2;
  const hue2rgb = function (hue) {
    if (hue < 0) {
      hue += 1;
    }
    if (hue > 1) {
      hue -= 1;
    }
    if (6 * hue < 1) {
      return var1 + (var2 - var1) * 6 * hue;
    }
    if (2 * hue < 1) {
      return var2;
    }
    if (3 * hue < 2) {
      return var1 + (var2 - var1) * 6 * (2 / 3 - hue);
    }
    return var1;
  };
  return rgb2hex(hue2rgb(h + 1 / 3), hue2rgb(h), hue2rgb(h - 1 / 3));
}

function hueFromName(name) {
  let a = 1;
  for (let i = 0; i < name.length; i++) {
    a = (17 * (a + name.charCodeAt(i))) % 360;
  }
  return a / 360;
}

function getLastElement(arr: any[]) {
  return arr[arr.length - 1];
}

/** Remove an element from the `el` DOM. */
function removeElement(el: HTMLElement) {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/** 手动实现继承: Set Child.prototype.__proto__ to Super.prototype */
function inherit(Child, Super) {
  function F() {}
  F.prototype = Super.prototype;
  Child.prototype = new F();
  Child.prototype.constructor = Child;
}
