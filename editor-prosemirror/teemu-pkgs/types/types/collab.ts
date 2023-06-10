import { type Step } from 'prosemirror-transform';
import { type Transaction } from 'prosemirror-state';

import { type PatchedStep, type PMDoc } from './document';

// collab /join
export interface IJoinResponse {
  doc: PMDoc;
  steps: PatchedStep[];
  version: number;
  userCount: number;
}
export interface ISaveCollabStepsParams {
  version: number;
  steps: Step[];
  clientID: number;
  origins: readonly Transaction[];
}
export interface INewStepsResponse {
  version: number;
  steps: { [key: string]: any }[];
  clientIDs: number[];
  usersCount: number;
}
