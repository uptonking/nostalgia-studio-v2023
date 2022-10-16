import { AwaitingWithBuffer, Client } from './client';
import { Selection } from './selection';
import { TextOperation } from './text-operation';
import { UndoManager } from './undo-manager';
import { WrappedOperation } from './wrapped-operation';

class SelfMeta {
  selectionBefore: any;
  selectionAfter: any;

  constructor(selectionBefore, selectionAfter) {
    this.selectionBefore = selectionBefore;
    this.selectionAfter = selectionAfter;
  }

  invert() {
    return new SelfMeta(this.selectionAfter, this.selectionBefore);
  }

  compose(other) {
    return new SelfMeta(this.selectionBefore, other.selectionAfter);
  }

  transform(operation) {
    return new SelfMeta(
      this.selectionBefore.transform(operation),
      this.selectionAfter.transform(operation),
    );
  }
}

class OtherMeta {
  clientId: any;
  selection: any;

  constructor(clientId, selection) {
    this.clientId = clientId;
    this.selection = selection;
  }

  transform(operation) {
    return new OtherMeta(
      this.clientId,
      this.selection && this.selection.transform(operation),
    );
  }

  static fromJSON(obj) {
    return new OtherMeta(
      obj.clientId,
      obj.selection && Selection.fromJSON(obj.selection),
    );
  }
}

class OtherClient {
  /** 当前服务端维持的文本变更版本号（version） */
  id: any;
  listEl: any;
  editorAdapter: any;
  name: any;
  li: HTMLLIElement;
  hue: any;
  color: string;
  lightColor: string;
  selection: any;
  mark: any;

  constructor(id, listEl, editorAdapter, name?: string, selection?: Selection) {
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

export class EditorClient extends Client {
  serverAdapter: any;
  editorAdapter: any;
  undoManager: UndoManager;
  clients: any;
  clientListEl: any;
  selection: any;

  constructor(revision, clients, serverAdapter, editorAdapter) {
    super(revision);
    // Client.call(this, revision);
    console.log('EditorClient.this ->', this);
    this.serverAdapter = serverAdapter;
    this.editorAdapter = editorAdapter;
    this.undoManager = new UndoManager();

    this.initializeClientList();
    this.initializeClients(clients);

    const self = this;

    this.editorAdapter.registerCallbacks({
      // 本地文本有变更
      change: function (operation, inverse) {
        self.onChange(operation, inverse);
      },
      // 本地光标位置有变更
      selectionChange: function () {
        self.onSelectionChange();
      },
      // 编辑器失焦
      blur: function () {
        self.onBlur();
      },
    });
    this.editorAdapter.registerUndo(function () {
      self.undo();
    });
    this.editorAdapter.registerRedo(function () {
      self.redo();
    });

    this.serverAdapter.registerCallbacks({
      client_left: function (clientId) {
        self.onClientLeft(clientId);
      },
      set_name: function (clientId, name) {
        self.getClientObject(clientId).setName(name);
      },
      ack: function () {
        self.serverAck();
      },
      operation: function (operation) {
        self.applyServer(TextOperation.fromJSON(operation));
      },
      selection: function (clientId, selection) {
        if (selection) {
          self
            .getClientObject(clientId)
            .updateSelection(
              self.transformSelection(Selection.fromJSON(selection)),
            );
        } else {
          self.getClientObject(clientId).removeSelection();
        }
      },
      clients: function (clients) {
        let clientId;
        for (clientId in self.clients) {
          if (
            self.clients.hasOwnProperty(clientId) &&
            !clients.hasOwnProperty(clientId)
          ) {
            self.onClientLeft(clientId);
          }
        }

        for (clientId in clients) {
          if (clients.hasOwnProperty(clientId)) {
            const clientObject = self.getClientObject(clientId);

            if (clients[clientId].name) {
              clientObject.setName(clients[clientId].name);
            }

            const selection = clients[clientId].selection;
            if (selection) {
              self.clients[clientId].updateSelection(
                self.transformSelection(Selection.fromJSON(selection)),
              );
            } else {
              self.clients[clientId].removeSelection();
            }
          }
        }
      },
      reconnect: function () {
        self.serverReconnect();
      },
    });
  }

  addClient(clientId, clientObj) {
    this.clients[clientId] = new OtherClient(
      clientId,
      this.clientListEl,
      this.editorAdapter,
      clientObj.name || clientId,
      clientObj.selection ? Selection.fromJSON(clientObj.selection) : null,
    );
  }

  initializeClients(clients) {
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

  initializeClientList() {
    this.clientListEl = document.createElement('ul');
  }

  applyUnredo(operation) {
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
    const self = this;
    if (!this.undoManager.canUndo()) {
      return;
    }
    this.undoManager.performUndo(function (o) {
      self.applyUnredo(o);
    });
  }

  redo() {
    const self = this;
    if (!this.undoManager.canRedo()) {
      return;
    }
    this.undoManager.performRedo(function (o) {
      self.applyUnredo(o);
    });
  }

  onChange(textOperation, inverse) {
    const selectionBefore = this.selection;
    this.updateSelection();
    const meta = new SelfMeta(selectionBefore, this.selection);
    const operation = new WrappedOperation(textOperation, meta);
    const compose =
      this.undoManager.undoStack.length > 0 &&
      inverse.shouldBeComposedWithInverted(
        last(this.undoManager.undoStack).wrapped,
      );
    const inverseMeta = new SelfMeta(this.selection, selectionBefore);
    this.undoManager.add(new WrappedOperation(inverse, inverseMeta), compose);
    this.applyClient(textOperation);
  }

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

  sendSelection(selection) {
    if (this.state instanceof AwaitingWithBuffer) {
      return;
    }
    this.serverAdapter.sendSelection(selection);
  }

  sendOperation(revision, operation) {
    this.serverAdapter.sendOperation(
      revision,
      operation.toJSON(),
      this.selection,
    );
  }

  applyOperation(operation) {
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

// Set Const.prototype.__proto__ to Super.prototype
function inherit(Const, Super) {
  function F() {}
  F.prototype = Super.prototype;
  Const.prototype = new F();
  Const.prototype.constructor = Const;
}

function last(arr) {
  return arr[arr.length - 1];
}

// Remove an element from the DOM.
function removeElement(el) {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
}
