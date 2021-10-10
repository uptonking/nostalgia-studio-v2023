import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { favoriteArticle, unfavoriteArticle } from '../../api/ArticlesAPI';
import { ArticleAction } from '../../reducers/article';
import { ArticleListAction } from '../../reducers/articleList';
import { IArticle } from '../../types';

type FavoriteButtonProps = {
  article: IArticle;
  dispatch: React.Dispatch<ArticleAction & ArticleListAction>;
  children: React.ReactNode;
  user?: any;
};

export default function FavoriteButton({
  article,
  dispatch,
  children,
  user,
}: FavoriteButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    if (!user) {
      navigate('/register');
      return;
    }

    setLoading(true);
    if (article.favorited) {
      const payload = await unfavoriteArticle(article.slug);
      dispatch({
        type: 'ARTICLE_UNFAVORITED',
        payload: payload.data,
      });
    } else {
      const payload = await favoriteArticle(article.slug);
      dispatch({
        type: 'ARTICLE_FAVORITED',
        payload: payload.data,
      });
    }
    setLoading(false);
  };

  const classNames = ['btn', 'btn-sm'];

  if (article.favorited) {
    classNames.push('btn-primary');
  } else {
    classNames.push('btn-outline-primary');
  }

  return (
    <button
      style={{ height: '28px' }}
      className={classNames.join(' ')}
      onClick={handleClick}
      disabled={loading}
    >
      <i className='ion-heart' />
      &nbsp;
      {children}
    </button>
  );
}
