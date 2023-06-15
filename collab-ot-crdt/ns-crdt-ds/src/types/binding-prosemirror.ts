import { type Comment, type CommentId } from './comment';
import { type Char } from './common';

export type RootDoc = {
  text: Array<Char>;
  comments: Record<CommentId, Comment>;
};
