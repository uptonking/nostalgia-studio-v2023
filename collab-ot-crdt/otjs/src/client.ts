import { TextOperation } from './text-operation';

/** 客户端、服务端通信时要执行的操作 */
interface ClientServerMessenger {
  applyClient: (client, operation: TextOperation) => any;
  applyServer: (client, operation: TextOperation) => any;
  serverAck: (client) => any;
  transformSelection: (selection) => any;
}

/**
 * In the 'AwaitingWithBuffer' state, the client is waiting for an operation
 * to be acknowledged by the server while buffering the edits the user makes
 * - 等待服务端 ack，同时缓存本地的新操作
 */
export class AwaitingWithBuffer implements ClientServerMessenger {
  /** 已发送但未收到服务端确认的op */
  outstanding: TextOperation;
  /** 因为未收到服务端确认，而积压在本地的未发送但可合并的op */
  buffer: TextOperation;

  constructor(outstanding: TextOperation, buffer: TextOperation) {
    // Save the pending operation and the user's edits since then
    this.outstanding = outstanding;
    this.buffer = buffer;
  }

  /** 若未收到服务端ack，就会一直缓存本地新增的操作 */
  applyClient(client, operation: TextOperation) {
    // Compose the user's changes onto the buffer
    const newBuffer = this.buffer.compose(operation);
    return new AwaitingWithBuffer(this.outstanding, newBuffer);
  }

  /** 收到服务端新op，转换后再apply到本地
   */
  applyServer(client, operation: TextOperation) {
    // Operation comes from another client
    //
    //         本地           /\   服务端
    //     this.outstanding /  \ operation
    //                     /    \
    //                    /\    /
    //       this.buffer /  \* / pair1[0] (new outstanding)
    //                  /    \/
    //                  \    /
    //          pair2[1] \  / pair2[0] (new buffer)
    // the transformed    \/
    // operation -- can
    // be applied to the
    // client's current
    // document
    //
    // * pair1[1]
    // const transform = operation.constructor.transform;
    const transform = TextOperation.transform;
    const pair1 = transform(this.outstanding, operation);
    const pair2 = transform(this.buffer, pair1[1]);
    client.applyOperation(pair2[1]);
    return new AwaitingWithBuffer(pair1[0], pair2[0]);
  }

  /** The pending operation has been acknowledged
   * => send buffer
   * - 发送缓存在客户端的buffer，设置状态为AwaitingConfirm，版本号加1
   */
  serverAck(client) {
    client.sendOperation(client.revision, this.buffer);
    return new AwaitingConfirm(this.buffer);
  }

  transformSelection(selection) {
    return selection.transform(this.outstanding).transform(this.buffer);
  }

  resend(client) {
    // The confirm didn't come because the client was disconnected.
    // Now that it has reconnected, we resend the outstanding operation.
    client.sendOperation(client.revision, this.outstanding);
  }
}

/**
 *  In the 'AwaitingConfirm' state, there's one operation the client has sent
 * to the server and is still waiting for an acknowledgement.
 * - 本地已发送操作至服务端，正在等待回应，且本地没有其他操作
 */
class AwaitingConfirm implements ClientServerMessenger {
  /** Save the pending operation，已发送但未收到服务端确认的 */
  outstanding: TextOperation;

  constructor(outstanding: TextOperation) {
    this.outstanding = outstanding;
  }

  /** 客户端新op会缓存，转换状态 */
  applyClient(client, operation: TextOperation) {
    // When the user makes an edit, don't send the operation immediately,
    // instead switch to 'AwaitingWithBuffer' state
    return new AwaitingWithBuffer(this.outstanding, operation);
  }

  /** 在等待确认阶段，收到服务端新op，ot转换后再apply到本地
   */
  applyServer(client, operation: TextOperation) {
    // This is another client's operation. Visualization:
    //
    //      本地          /\   服务端
    // this.outstanding /  \ operation
    //                 /    \
    //                 \    /
    //  pair[1]         \  / pair[0] (new outstanding)
    //  (can be applied  \/
    //  to the client's
    //  current document)
    // const pair = operation.constructor.transform(this.outstanding, operation);
    const pair = TextOperation.transform(this.outstanding, operation);
    client.applyOperation(pair[1]);
    return new AwaitingConfirm(pair[0]);
  }

  /** The client's operation has been acknowledged
   * => switch to synchronized state
   */
  serverAck(client) {
    return synchronized_;
  }

  transformSelection(selection) {
    return selection.transform(this.outstanding);
  }

  /** The confirm didn't come because the client was disconnected.
   * Now that it has reconnected, we resend the outstanding operation.
   */
  resend(client) {
    client.sendOperation(client.revision, this.outstanding);
  }
}

/**
 * In the 'Synchronized' state, there is no pending operation that the client
 * has sent to the server.
 * - 此时本地文档与服务端一致，且无本地新op和服务端新op
 */
class Synchronized implements ClientServerMessenger {
  /** 发送op，转换为 AwaitingConfirm 状态等待服务端回应
   */
  applyClient(client: OperationClient, operation: TextOperation) {
    // When the user makes an edit, send the operation to the server and
    // switch to the 'AwaitingConfirm' state
    client.sendOperation(client.revision, operation);
    return new AwaitingConfirm(operation);
  }

  /** 接收服务端的操作，因本地无新操作，可以直接将远端操作应用到文档中
   */
  applyServer(client, operation) {
    // When we receive a new operation from the server, the operation can be
    // simply applied to the current document
    client.applyOperation(operation);
    return this;
  }

  /** Synchronized 状态下不会收到 ack */
  serverAck(client) {
    throw new Error('There is no pending operation.');
  }

  /** Nothing to do because the latest server state and client state are the same.
   * - Synchronized 状态下本地光标位置与服务端一致
   */
  transformSelection(x) {
    return x;
  }
}

/** Singleton，全局单例的操作状态 */
const synchronized_ = new Synchronized();

/**
 * 处理客户端的同步状态，包括 Synchronized、AwaitingConfirm、AwaitingWithBuffer
 */
export class OperationClient implements ClientServerMessenger {
  /** the next expected revision number.
  * - 只在收到服务端的ack和发来的op时才加1
   */
  revision: number;
  /** 客户端operation的状态  */
  state: Synchronized | AwaitingConfirm | AwaitingWithBuffer;

  constructor(revision: number) {
    this.revision = revision;
    this.state = synchronized_; // start state
  }

  setState(state: Synchronized | AwaitingConfirm | AwaitingWithBuffer) {
    this.state = state;
  }

  /** Call this method when the user changes the document.
   * - 本地有操作变化时触发，3种state都有实现 applyClient 同名方法
   */
  applyClient(operation: TextOperation) {
    const newState = this.state.applyClient(this, operation);
    this.setState(newState);
  }

  /** Call this method with a new operation from the server
   * - 远端有操作变化时触发，3种state都有实现 applyServer 同名方法，版本号+1
   */
  applyServer(operation) {
    this.revision++;
    this.setState(this.state.applyServer(this, operation));
  }

  /** 发送给服务端的op，得到服务端的肯定回应，版本号+1
   */
  serverAck() {
    this.revision++;
    if (
      this.state instanceof AwaitingConfirm ||
      this.state instanceof AwaitingWithBuffer
    ) {
      this.setState(this.state.serverAck(this));
    }
  }

  serverReconnect() {
    // @ts-ignore
    if (typeof this.state.resend === 'function') {
      // @ts-ignore
      this.state.resend(this);
    }
  }

  /** Transforms a selection from the latest known server state to the current
   * client state. For example, if we get from the server the information that
   * another user's cursor is at position 3, but the server hasn't yet received
   * our newest operation, an insertion of 5 characters at the beginning of the
   * document, the correct position of the other user's cursor in our current
   * document is 8.
   */
  transformSelection(selection) {
    return this.state.transformSelection(selection);
  }

  /** Override this method. */
  sendOperation(revision, operation) {
    throw new Error('sendOperation must be defined in child class');
  }

  /** Override this method. */
  applyOperation(operation) {
    throw new Error('applyOperation must be defined in child class');
  }
}
