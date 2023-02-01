import type { Socket } from 'socket.io-client';

import type { Selection } from './selection';

/**
 * 在客户端监听服务端发来的socket事件，然后执行已注册的对应函数
 * - 自己实现了类似eventemitter的逻辑
 * - 还提供了与server通信的方法
 */
export class SocketIOAdapter {
  socket: Socket;
  /** 存放服务端发来消息后，在客户端待执行的事件函数，类似event-emitter的实现 */
  callbacks: Record<string, (...args: any[]) => void>;

  constructor(socket: Socket) {
    this.socket = socket;

    const self = this;

    // 观察远端发送过来的操作
    socket
      .on('client_left', function (clientId) {
        // 远端有client链接断开
        self.trigger('client_left', clientId);
      })
      .on('set_name', function (clientId, name) {
        self.trigger('set_name', clientId, name);
      })
      .on('ack', function () {
        self.trigger('ack');
      })
      .on('operation', function (clientId, operation, selection) {
        // 第三个参数服务端name是meta
        self.trigger('operation', operation);
        self.trigger('selection', clientId, selection);
      })
      .on('selection', function (clientId, selection) {
        self.trigger('selection', clientId, selection);
      })
      .on('reconnect', function () {
        self.trigger('reconnect');
      });
  }

  // 发送本地操作
  sendOperation(revision, operation, selection) {
    // console.log('soc.sendOperation, ', {
    //   revision,
    //   operation,
    //   selection,
    // });
    this.socket.emit('operation', revision, operation, selection);
  }

  // 发送当前光标所处位置
  sendSelection(selection: Selection) {
    // console.log('socket.client.sendSelection ->', {
    //   selection,
    // });
    this.socket.emit('selection', selection);
  }

  /** 注册cb到当前类，缺点是只能注册一次，不能添加、删除、修改 */
  registerCallbacks(cb: Record<string, (...args: any[]) => void>) {
    this.callbacks = cb;
  }

  // trigger(event, ...rest) {
  //   const args = Array.prototype.slice.call(arguments, 1);
  //   // console.log('SocketIOAdapter.trigger ->', event, args);
  //   const cb = this.callbacks && this.callbacks[event];
  //   if (cb) {
  //     cb.apply(this, args);
  //   }
  // }

  /**
   * 触发执行已注册的event类型的cb
   */
  trigger(event: string, ...restArgs: any[]) {
    const cb = this.callbacks && this.callbacks[event];
    if (cb) {
      cb.apply(this, restArgs);
    }
  }
}
