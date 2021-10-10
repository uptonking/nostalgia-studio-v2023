import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { followProfile, unfollowProfile } from '../../api/ProfileAPI';
import useAuth from '../../context/auth';
import { ArticleAction } from '../../reducers/article';
import { IArticle } from '../../types';
import FavoriteButton from '../common/FavoriteButton';
import FollowUserButton from '../common/FollowUserButton';
import DeleteButton from './DeleteButton';

type ArticleActionsProps = {
  article: IArticle;
  dispatch: React.Dispatch<ArticleAction>;
};

export default function ArticleActions({
  article,
  dispatch,
}: ArticleActionsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    state: { user },
  } = useAuth();

  const canModifyArticle = user && user.username === article.author.username;

  const handleFollowButtonClick = async () => {
    if (!user) {
      navigate('/register');
      return;
    }

    setLoading(true);
    if (article.author.following) {
      await followProfile(article.author.username);
      dispatch({ type: 'UNFOLLOW_AUTHOR' });
    } else {
      await unfollowProfile(article.author.username);
      dispatch({ type: 'FOLLOW_AUTHOR' });
    }
    setLoading(false);
  };

  return canModifyArticle ? (
    // 编辑 / 删除文章
    <React.Fragment>
      <Link
        to={`/editor/${article.slug}`}
        className='btn btn-outline-secondary btn-sm'
      >
        <i className='ion-edit' /> Edit Article
      </Link>
      <DeleteButton article={article} />
    </React.Fragment>
  ) : (
    // 关注作者 / 收藏文章
    <React.Fragment>
      <FollowUserButton
        onClick={handleFollowButtonClick}
        profile={article.author}
        loading={loading}
      />
      <FavoriteButton article={article} dispatch={dispatch} user={user}>
        {article.favorited ? 'Unfavorite Article' : 'Favorite Article'}
        <span className=''>({article.favoritesCount})</span>
      </FavoriteButton>
    </React.Fragment>
  );
}
