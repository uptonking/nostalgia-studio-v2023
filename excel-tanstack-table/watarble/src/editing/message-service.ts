import { type UID } from '../types';

export interface MessageService<T = any> {
  /** send message to all clients, and trigger registered listeners callbacks */
  sendMessage: (message: T) => void;

  /** register callback each time a new message is received. */
  onNewMessage: (id: UID, callback: (...args: any[]) => unknown) => void;

  /** unregister a callback for client id */
  leave: (id: UID) => void;
}

export class LocalMessageService implements MessageService {
  private listeners: { id: UID; callback: (...args: any[]) => unknown }[] = [];

  sendMessage(message) {
    for (const { callback } of this.listeners) {
      callback(message);
    }
  }

  onNewMessage(id: UID, callback: (...args: any[]) => unknown) {
    this.listeners.push({ id, callback });
  }

  leave(id: UID) {
    this.listeners = this.listeners.filter((listener) => listener.id !== id);
  }
}
