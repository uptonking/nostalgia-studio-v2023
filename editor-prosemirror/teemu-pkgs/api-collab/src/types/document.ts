import { type Step } from 'prosemirror-transform';

export type PatchedStep = Step & { clientID: number };
