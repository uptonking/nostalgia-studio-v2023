import { Node } from 'prosemirror-model';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
  NO_ORDER = 'no_order',
}

export interface Transformer<T> {
  encode(node: Node): T;
  parse(content: T): Node;
}

export { AnnotationUpdateEmitter, AnnotationUpdateEvent } from './annotation';

export type {
  AnnotationState,
  AnnotationProviders,
  AnnotationUpdateEventPayloads,
  InlineCommentSelectionComponentProps,
  InlineCommentViewComponentProps,
  InlineCommentAnnotationProvider,
  OnAnnotationClickPayload,
  AnnotationByMatches,
  AnnotationActionResult,
} from './annotation';

export type { TypeAheadItem, TypeAheadItemRenderProps } from './typeAhead';
