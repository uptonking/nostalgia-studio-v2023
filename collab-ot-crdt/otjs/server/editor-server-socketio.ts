import type { Socket } from 'socket.io';

import { Selection } from '../src/selection';
import { TextOperation } from '../src/text-operation';
import { WrappedOperation } from '../src/wrapped-operation';
import { Orchestrator } from './orchestrator';

export class EditorSocketIOServer extends Orchestrator {
  users: Record<string, any>;
  docId: any;
  mayWrite: (_: any, fn: (args: any) => void) => void;

  constructor(document, operations, docId, mayWrite?: any) {
    super(document, operations);
    this.users = {};
    this.docId = docId;
    this.mayWrite =
      mayWrite ||
      function mayWriteByDefault(_, cb) {
        cb(true);
      };
  }

  addClient(socket: Socket) {
    const self = this;
    // socket.join(this.docId)
    socket.emit('doc', {
      str: this.document,
      revision: this.operations.length,
      clients: this.users,
    });

    socket.on('operation', function (revision, operation, selection) {
      self.mayWrite(socket, function (mayWrite) {
        if (!mayWrite) {
          console.log("User doesn't have the right to edit.");
          return;
        }
        self.onOperation(socket, revision, operation, selection);
      });
    });

    socket.on('selection', function (obj) {
      self.mayWrite(socket, function (mayWrite) {
        if (!mayWrite) {
          console.log("User doesn't have the right to edit.");
          return;
        }
        self.updateSelection(socket, obj && Selection.fromJSON(obj));
      });
    });

    socket.on('disconnect', function () {
      console.log('socket disconnect ', socket.id);
      // socket.leave(self.docId);
      self.onDisconnect(socket);
      // if (
      //   (socket.manager &&
      //     socket.manager.sockets.clients(self.docId).length === 0) || // socket.io <= 0.9
      //   (socket.ns && Object.keys(socket.ns.connected).length === 0) // socket.io >= 1.0
      // ) {
      //   self.emit('empty-room');
      // }
    });
  }

  // 处理操作接收
  onOperation(socket, revision, operation, selection) {
    let wrapped;
    try {
      // 转换成一个wrap格式的操作数据结构
      wrapped = new WrappedOperation(
        TextOperation.fromJSON(operation),
        selection && Selection.fromJSON(selection),
      );
    } catch (exc) {
      console.error('Invalid operation received: ' + exc);
      return;
    }

    try {
      const clientId = socket.id;
      const wrappedPrime = this.receiveOperation(revision, wrapped);
      console.log('new operation: ' + JSON.stringify(wrapped));
      this.getClient(clientId).selection = wrappedPrime.meta;
      socket.emit('ack');
      socket.broadcast
        .to(this.docId)
        .emit(
          'operation',
          clientId,
          wrappedPrime.wrapped.toJSON(),
          wrappedPrime.meta,
        );
    } catch (exc) {
      console.error(exc);
    }
  }

  updateSelection(socket, selection) {
    const clientId = socket.id;
    if (selection) {
      this.getClient(clientId).selection = selection;
    } else {
      delete this.getClient(clientId).selection;
    }
    socket.broadcast.to(this.docId).emit('selection', clientId, selection);
  }

  setName(socket, name) {
    const clientId = socket.id;
    this.getClient(clientId).name = name;
    socket.broadcast.to(this.docId).emit('set_name', clientId, name);
  }

  getClient(clientId) {
    return this.users[clientId] || (this.users[clientId] = {});
  }

  onDisconnect(socket: Socket) {
    const clientId = socket.id;
    delete this.users[clientId];
    socket.broadcast.to(this.docId).emit('client_left', clientId);
  }
}
