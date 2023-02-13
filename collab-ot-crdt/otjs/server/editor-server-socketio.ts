import type { Socket } from 'socket.io';

import { Selection } from '../src/selection';
import { TextOperation } from '../src/text-operation';
import { WrappedOperation } from '../src/wrapped-operation';
import { OpOrchestrator } from './op-orchestrator';

/**
 * 通过socket.on添加各种事件监听器，其他方法都是为此服务
 */
export class EditorSocketServer extends OpOrchestrator {
  users: Record<string, Record<'selection' | 'name', any>>;
  docId: string;
  mayWrite: (_: any, fn: (args: any) => void) => void;

  constructor(
    document: string,
    operations: WrappedOperation[],
    docId: string,
    mayWrite?: any,
  ) {
    super(document, operations);
    this.users = {};
    this.docId = docId;
    this.mayWrite =
      mayWrite ||
      function mayWriteByDefault(_, cb) {
        cb(true);
      };
  }

  /** socket.on添加各种事件监听器
   * - socket client 连接时会发送最新doc对象和版本 */
  addClient(socket: Socket) {
    const self = this;
    socket.join(this.docId);
    socket.emit('doc', {
      str: this.document,
      revision: this.operations.length,
      clients: this.users,
    });

    socket.on('operation', (revision, operation, selection) => {
      self.mayWrite(socket, function (mayWrite) {
        if (!mayWrite) {
          console.log("User doesn't have the right to edit.");
          return;
        }
        self.onOperation(socket, revision, operation, selection);
      });
    });

    socket.on('selection', (obj) => {
      self.mayWrite(socket, (mayWrite) => {
        if (!mayWrite) {
          console.log("User doesn't have the right to edit.");
          return;
        }
        self.updateSelection(socket, obj && Selection.fromJSON(obj));
      });
    });

    socket.on('disconnect', () => {
      console.log('socket disconnect ', socket.id);
      socket.leave(self.docId);
      self.onDisconnect(socket);
      if (
        // (socket.ns && Object.keys(socket.ns.connected).length === 0) // socket.io >= 1.0
        socket.rooms.size === 0
      ) {
        self.emit('empty-room');
      }
    });
  }

  /** 处理operation接收 */
  onOperation(socket: Socket, revision: number, operation, selection) {
    let wrapped: WrappedOperation;
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
      // 👇🏻 拿到发来操作oA对应的服务端执行形式 oA'，并转发给其他客户端，其他客户端可直接执行而不必ot
      const wrappedPrime = this.receiveOperation(revision, wrapped);
      console.log('new operation: ' + JSON.stringify(wrapped));
      this.getClient(clientId).selection = wrappedPrime.meta;
      socket.emit('ack');
      // 👇🏻 将转换后的oA'转发给除sender外的其他所有clients
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

  updateSelection(socket: Socket, selection) {
    const clientId = socket.id;
    if (selection) {
      this.getClient(clientId).selection = selection;
    } else {
      delete this.getClient(clientId).selection;
    }
    socket.broadcast.to(this.docId).emit('selection', clientId, selection);
  }

  setName(socket: Socket, name) {
    const clientId = socket.id;
    this.getClient(clientId).name = name;
    socket.broadcast.to(this.docId).emit('set_name', clientId, name);
  }

  getClient(clientId: string) {
    return this.users[clientId] || (this.users[clientId] = {} as any);
  }

  onDisconnect(socket: Socket) {
    const clientId = socket.id;
    delete this.users[clientId];
    socket.broadcast.to(this.docId).emit('client_left', clientId);
  }
}
