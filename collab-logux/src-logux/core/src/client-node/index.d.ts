import { BaseNode } from '../base-node/index';
import { type Log, type Meta } from '../log/index';

/**
 * Client node in synchronization pair.
 *
 * Instead of server node, it initializes synchronization
 * and sends connect message.
 *
 * ```js
 * import { ClientNode } from '@logux/core'
 * const connection = new BrowserConnection(url)
 * const node = new ClientNode(nodeId, log, connection)
 * ```
 */
export class ClientNode<
  Headers extends object = {},
  NodeLog extends Log = Log<Meta>,
> extends BaseNode<Headers, NodeLog> {}
