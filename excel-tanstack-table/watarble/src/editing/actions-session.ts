import {
  type Client,
  type ClientId,
  type Command,
  type CoreCommand,
  type HistoryChange,
  type UID,
} from '../types';
import { DEFAULT_REVISION_ID } from '../utils/constants';
import { EventEmitter } from '../utils/event-emitter';
import { UuidGenerator } from '../utils/uuid';
import { LocalMessageService, type MessageService } from './message-service';
import { Revision } from './revision';
import { RevisionManager } from './revision-manager';

export type ActionsSessionOptions = {
  revisions?: RevisionManager<Revision>;
  messageService?: MessageService;
  remoteRevisionId?: string;
};

export const MESSAGE_VERSION = 1;

export class ActionsSession extends EventEmitter {
  private clientId: ClientId = 'local';
  private clients: Record<ClientId, Client | undefined> = {};

  private revisions: RevisionManager<Revision>;
  private remoteRevisionId: string;
  private messageService: MessageService;

  private uuidGenerator = new UuidGenerator();
  // private processedRevisions: Set<UID> = new Set();

  constructor({
    revisions,
    messageService,
    remoteRevisionId,
  }: ActionsSessionOptions = {}) {
    super();
    this.revisions =
      revisions ||
      new RevisionManager<Revision>({
        initialOperationId: DEFAULT_REVISION_ID,
      });
    this.messageService = messageService || new LocalMessageService();
    this.remoteRevisionId = remoteRevisionId || DEFAULT_REVISION_ID;
    // window['rev'] = this.revisions;
  }

  /**
   * save commands and changes as revision and add to undoStack
   */
  save(
    rootCommand: Command,
    commands: CoreCommand[],
    changes: HistoryChange[],
  ) {
    // if (!commands.length || !changes.length) return;
    if (!changes.length) return;

    const revision = new Revision(
      this.uuidGenerator.uuidv4(),
      this.clientId,
      commands,
      rootCommand,
      changes,
      Date.now(),
    );
    this.revisions.append(revision.id, revision);

    this.emit('_SES_NEW_LOCAL_STATE_UPDATE', { id: revision.id });

    this.messageService.sendMessage({
      type: 'REMOTE_REVISION',
      version: MESSAGE_VERSION,
      serverRevisionId: this.remoteRevisionId,
      nextRevisionId: revision.id,
      clientId: revision.clientId,
      commands: revision.commands,
    });
  }

  undo(revisionId: UID) {
    this.messageService.sendMessage({
      type: '_SRV_REVISION_UNDONE',
      version: MESSAGE_VERSION,
      serverRevisionId: this.remoteRevisionId,
      nextRevisionId: this.uuidGenerator.uuidv4(),
      undoneRevisionId: revisionId,
    });
  }

  redo(revisionId: UID) {
    this.messageService.sendMessage({
      type: '_SRV_REVISION_REDONE',
      version: MESSAGE_VERSION,
      serverRevisionId: this.remoteRevisionId,
      nextRevisionId: this.uuidGenerator.uuidv4(),
      redoneRevisionId: revisionId,
    });
  }

  join(client?: Client) {
    if (client) {
      this.clients[client.id] = client;
      this.clientId = client.id;
    } else {
      this.clients['local'] = { id: 'local', name: 'local' };
      this.clientId = 'local';
    }

    this.messageService.onNewMessage(
      this.clientId,
      this.onMessageReceived.bind(this),
    );
  }

  private onMessageReceived(message: any) {
    // if isAlreadyProcessed, return
    switch (message.type) {
      // case 'CLIENT_JOINED':
      //   this.onClientJoined(message);
      //   break;
      case '_SRV_REVISION_UNDONE':
        this.revisions.undo(
          message.undoneRevisionId,
          message.nextRevisionId,
          message.serverRevisionId,
        );
        this.emit('revision-undone', {
          revisionId: message.undoneRevisionId,
          commands: this.revisions.get(message.undoneRevisionId).commands,
        });
        break;

      case '_SRV_REVISION_REDONE': {
        this.revisions.redo(
          message.redoneRevisionId,
          message.nextRevisionId,
          message.serverRevisionId,
        );
        this.emit('_SES_REVISION_REDONE', {
          revisionId: message.redoneRevisionId,
          commands: this.revisions.get(message.redoneRevisionId).commands,
        });
        break;
      }

      case '_SRV_REMOTE_REVISION': {
        const { clientId, commands, timestamp } = message;

        if (clientId !== this.clientId) {
          const revision = new Revision(
            message.nextRevisionId,
            clientId,
            commands,
            'REMOTE',
            undefined,
            timestamp,
          );
          this.revisions.append(revision.id, revision);
          // this.revisions.insert(
          //   revision.id,
          //   revision,
          //   message.serverRevisionId,
          // );
          // this.trigger('remote-revision-received', {
          //   commands: transformAll(commands, pendingCommands),
          // });
        }
        break;
      }
    }

    this.emit('_SES_COLLAB_EVENT_RECEIVED');
  }

  private onClientJoined(message: any) {
    if (message.client.id !== this.clientId) {
      this.clients[message.client.id] = message.client;
      const client = this.clients[this.clientId];
      if (client) {
        const { position } = client;
        if (position) {
          // this.transportService.sendMessage({
          //   type: "CLIENT_MOVED",
          //   version: MESSAGE_VERSION,
          //   client: { ...client, position },
          // });
        }
      }
    }
  }
}
