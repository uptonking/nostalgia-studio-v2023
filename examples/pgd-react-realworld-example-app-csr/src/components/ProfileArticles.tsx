import * as React from 'react';

import {
  ArticleListState,
  ITab,
  articlesReducer,
} from '../reducers/articleList';
import { useEffect, useReducer } from 'react';

import ArticleList from './ArticleList';
import { ArticlesProvider } from '../context/articles';
import TabList from './common/TabList';
import useAuth from '../context/auth';

function ProfileArticles({ username }: { username: string }) {
  const {
    state: { user },
  } = useAuth();

  const authorLabel = `${
    user && user.username === username ? 'My ' : ''
  }Articles`;

  const tabsData: Array<ITab> = [
    { type: 'AUTHORED', label: authorLabel, username },
    {
      type: 'FAVORITES',
      label: 'Favorited Articles',
      username,
    },
  ];

  const userProfileInitialState: ArticleListState = {
    articles: [],
    loading: false,
    error: null,
    articlesCount: 0,
    page: 0,
    pageSize: 5,
    selectedTab: { type: 'AUTHORED', label: 'Articles', username },
  };

  const [state, dispatch] = useReducer(
    articlesReducer,
    userProfileInitialState,
  );

  return (
    <ArticlesProvider value={{ state, dispatch }}>
      <TabList data={tabsData} />
      <ArticleList />
    </ArticlesProvider>
  );
}

export default React.memo(ProfileArticles);
