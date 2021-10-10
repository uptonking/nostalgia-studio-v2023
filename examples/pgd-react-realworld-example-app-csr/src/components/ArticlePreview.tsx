import * as React from 'react';
import { Link } from 'react-router-dom';

import { Flex, Grid, Heading, Text, View } from '@adobe/react-spectrum';

import { ArticleListAction } from '../reducers/articleList';
import { IArticle } from '../types';
import ArticleAvatar from './common/ArticleAvatar';
import ArticleTags from './common/ArticleTags';
import FavoriteButton from './common/FavoriteButton';

type ArticlePreviewProps = {
  article: IArticle;
  dispatch: React.Dispatch<ArticleListAction>;
};

function generateSummaryDescriptionFromArticle(content) {
  if (content && content.length > 40) {
    return content.slice(0, 32);
  }

  return content;
}

export default function ArticlePreview({
  article,
  dispatch,
}: ArticlePreviewProps) {
  // console.log('==ArticlePreview, ', article);

  return (
    <View UNSAFE_style={{ borderTop: '1px solid rgba(0,0,0,.1)' }}>
      <Flex justifyContent='space-between' marginY='size-200'>
        <ArticleAvatar article={article} />
        <FavoriteButton article={article} dispatch={dispatch}>
          {article.favoritesCount}
        </FavoriteButton>
      </Flex>

      <Heading level={5}>{article.title}</Heading>
      <p>
        {article.description
          ? article.description
          : generateSummaryDescriptionFromArticle(article.body)}
      </p>

      <Flex
        justifyContent='space-between'
        // alignItems='top'
        marginTop='size-200'
        // marginBottom='size-0'
      >
        <Link to={`/article/${article.slug}`} className='preview-link'>
          <span>Read more...</span>
        </Link>
        <ArticleTags tagList={article.tagList} />
      </Flex>
    </View>
  );
}
