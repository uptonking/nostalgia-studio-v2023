import * as React from 'react';
import { createContext, useContext, useEffect, useReducer } from 'react';

import {
  ArticleListAction,
  ArticleListState,
  articlesReducer,
  initialState,
} from '../reducers/articleList';

type ArticleListContextProps = {
  state: ArticleListState;
  dispatch: React.Dispatch<ArticleListAction>;
};

const ArticlesContext = createContext<ArticleListContextProps>({
  state: initialState,
  dispatch: () => initialState,
});

export function ArticlesProvider(
  props: React.PropsWithChildren<{ value?: any }>,
) {
  const [state, dispatch] = useReducer(articlesReducer, initialState);

  const providerVal = props && props.value ? props.value : { state, dispatch };

  return <ArticlesContext.Provider value={providerVal} {...props} />;
}

export default function useArticles() {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error(`useArticles must be used within an ArticlesProvider`);
  }
  return context;
}
