import * as React from 'react';
import { Link } from 'react-router-dom';

import { Flex, Grid, View } from '@adobe/react-spectrum';

import useAuth from '../../context/auth';
import { ArticleAction } from '../../reducers/article';
import { IComment } from '../../types';
import Comment from './Comment';
import CommentInput from './CommentInput';

type CommentContainerProps = {
  comments: Array<IComment>;
  slug: string;
  dispatch: React.Dispatch<ArticleAction>;
};

function CommentContainer({ comments, slug, dispatch }: CommentContainerProps) {
  const {
    state: { user },
  } = useAuth();

  return (
    <Grid>
      {user ? (
        <CommentInput user={user} slug={slug} dispatch={dispatch} />
      ) : (
        <p>
          <Link to='/login'>Sign in</Link>
          &nbsp;or&nbsp;
          <Link to='/register'>Sign up</Link>
          &nbsp;to add comments on this article.
        </p>
      )}

      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          slug={slug}
          user={user}
          dispatch={dispatch}
        />
      ))}
    </Grid>
  );
}

export default React.memo(CommentContainer);
