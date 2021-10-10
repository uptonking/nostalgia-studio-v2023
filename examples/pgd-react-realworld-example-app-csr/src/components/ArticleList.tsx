import * as React from 'react';
import { useEffect } from 'react';

import {
  getArticles,
  getArticlesByAuthor,
  getArticlesByTag,
  getArticlesFavoritedBy,
  getFeedArticles,
} from '../api/ArticlesAPI';
import useArticles from '../context/articles';
import { ITab } from '../reducers/articleList';
import ArticlePreview from './ArticlePreview';
import ListPagination from './ListPagination';

const loadArticles = (tab: ITab, page = 0) => {
  switch (tab.type) {
    case 'FEED':
      return getFeedArticles();
    case 'ALL':
      return getArticles(page);
    case 'TAG':
      return getArticlesByTag(tab.label, page);
    case 'AUTHORED':
      return getArticlesByAuthor(tab.username, page);
    case 'FAVORITES':
      return getArticlesFavoritedBy(tab.username, page);
    default:
      // return getArticles(page);
      throw new Error('type does not exist');
  }
};

export default function ArticleList() {
  const {
    state: {
      articles,
      loading,
      error,
      articlesCount,
      selectedTab,
      page,
      pageSize,
    },
    dispatch,
  } = useArticles();

  useEffect(() => {
    let ignore = false;
    async function fetchArticles() {
      dispatch({ type: 'FETCH_ARTICLES_BEGIN' });
      try {
        // console.log('==selectedTab, ', selectedTab);
        // console.log('==page, ', page);
        const payload = await loadArticles(selectedTab, page);
        if (!ignore) {
          dispatch({
            type: 'FETCH_ARTICLES_SUCCESS',
            payload: (payload as any).data,
          });
        }
      } catch (error) {
        if (!ignore) {
          dispatch({ type: 'FETCH_ARTICLES_ERROR', error });
        }
      }
    }
    fetchArticles();
    return () => {
      ignore = true;
    };
  }, [dispatch, page, selectedTab]);

  if (loading) {
    return <div className='article-preview'>Loading...</div>;
  }

  if (articles.length === 0) {
    return <div className='article-preview'>No articles are here... yet.</div>;
  }

  // console.log('==ArticleList, ', articles);
  return (
    <React.Fragment>
      {articles.map((article, index) => (
        <ArticlePreview
          key={article.slug}
          article={article}
          dispatch={dispatch}
        />
      ))}
      <ListPagination
        page={page}
        pageSize={pageSize}
        articlesCount={articlesCount}
        dispatch={dispatch}
      />
    </React.Fragment>
  );
}
