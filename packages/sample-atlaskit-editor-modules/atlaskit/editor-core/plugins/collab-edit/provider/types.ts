import type { ServiceConfig } from '@atlaskit/util-service-support';

import type {
  CollabParticipant as Participant,
  CollabEventTelepointerData as TelepointerData,
} from '../../../../editor-common';

export type {
  CollabEvent,
  CollabEventData,
  CollabEditProvider,
} from '../../../../editor-common';

export type { TelepointerData, Participant };

export interface DocumentResponse {
  version: number;
  doc: any;
}

export interface StepResponse {
  version: number;
  steps: any[];
}

export type MixedResponse = DocumentResponse & StepResponse;

export interface Config extends ServiceConfig {
  docId: string;
  userId: string;
}

/**
 * Same as PubSub client types (don't want a direct dep though)
 */

export type ARI = string;
export type AVI = string;

export interface PubSubOnEvent<T = any> {
  (event: string, data: T): void;
}

export interface PubSubClient {
  on(eventAvi: string, listener: PubSubOnEvent): PubSubClient;

  off(eventAvi: string, listener: PubSubOnEvent): PubSubClient;

  join(aris: ARI[]): Promise<PubSubClient>;

  leave(aris: ARI[]): Promise<PubSubClient>;
}

export enum PubSubSpecialEventType {
  ERROR = 'ERROR',
  CONNECTED = 'CONNECTED',
  RECONNECT = 'RECONNECT',
}
