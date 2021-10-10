import * as React from 'react';
import { Link } from 'react-router-dom';

import { Flex, Grid, Heading, Text, View } from '@adobe/react-spectrum';

import { IArticle } from '../../types';
import { ALT_IMAGE_URL } from '../../utils';

type ArticleAvatarProps = {
  article: IArticle;
};

const defaultProps = {
  article: {
    slug: 'how-to-train-your-dragon',
    title: 'How to train your dragon',
    description: 'Ever wonder how?',
    body: 'It takes a Jacobian',
    tagList: ['dragons', 'training'],
    createdAt: new Date('2016-02-18T03:22:56.637Z'),
    updatedAt: new Date('2016-02-18T03:48:35.824Z'),
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'jake',
      bio: 'I work at statefarm',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
      following: false,
    },
  },
};

export default function ArticleAvatar(
  props: ArticleAvatarProps = defaultProps,
) {
  // console.log('==aAvater, ', props);
  const {
    article: { author, createdAt },
  } = props;

  if (!author) {
    return null;
  }

  return (
    <Flex gap='size-100' justifyContent='start' alignItems='center'>
      <Link to={`/${author.username}`}>
        <img
          // src={ALT_IMAGE_URL}
          src={author.image || ALT_IMAGE_URL}
          alt={author.username}
          style={{ height: '32px', borderRadius: '30px' }}
        />
      </Link>

      <Grid>
        <Link className='author' to={`/${author.username}`}>
          {author.username}
        </Link>
        <span className='date'>{new Date(createdAt).toDateString()}</span>
      </Grid>
    </Flex>
  );
}
