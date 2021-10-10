import faker from 'faker';

import { articleList, getUserByUsername, userList } from './mockData';

function mockResPromise(dataOrList: unknown, timeout = 0) {
  return new Promise((resolve, reject) => {
    if (!dataOrList) {
      return setTimeout(() => reject(new Error('res data not found')), timeout);
    }

    return setTimeout(() => resolve({ data: dataOrList }), timeout);
  });
}

export function getArticles(pNum, pSize = 10) {
  const startIdx = pNum ? pNum * pSize : 0;
  const endIdx = startIdx + pSize;
  const retData = {
    articles: articleList.slice(startIdx, endIdx),
    articlesCount: articleList.length,
  };

  return mockResPromise(retData);
}

export function getArticlesByAuthor(username, pNum, pSize = 5) {
  const startIdx = pNum ? pNum * pSize : 0;
  const endIdx = startIdx + pSize;

  const matched = articleList.filter(
    (article) => article.author.username === username,
  );

  const retData = {
    articles: matched.slice(startIdx, endIdx),
    articlesCount: matched.length,
  };

  return mockResPromise(retData);
}
export function getArticlesByTag(tag, pNum, pSize = 10) {
  const startIdx = pNum ? pNum * pSize : 0;
  const endIdx = startIdx + pSize;

  const matched = articleList.filter((article) =>
    article.tagList.includes(tag),
  );

  const retData = {
    articles: matched.slice(startIdx, endIdx),
    articlesCount: matched.length,
  };

  return mockResPromise(retData);
}

export function getArticle(slug) {
  const matched = articleList.find((article) => article.slug === slug);

  const retData = {
    article: matched,
  };

  return mockResPromise(retData);
}

export function createArticle({ article }) {
  const retArticle = {
    ...article,
    slug: faker.lorem.slug(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorited: false,
    favoritesCount: 0,
    author: {
      ...getUserByUsername(article.user.username),
      following: false,
    },
  };

  delete retArticle['user'];

  articleList.push(retArticle);

  // console.log(`==, mock create ${article} success`);

  const retData = {
    article: retArticle,
  };

  return mockResPromise(retData);
}

export function updateArticle({ article }) {
  const matchedIndex = articleList.findIndex(
    (cur) => cur.slug === article.slug,
  );
  const matched = articleList[matchedIndex];
  const updated = { ...matched, ...article };
  // console.log('==updated, ', updatedArticle);
  articleList[matchedIndex] = updated;

  const retData = {
    article: updated,
  };

  return mockResPromise(retData);
}

export function getTags() {
  let articleTagList = new Set();
  articleList.forEach((article) => {
    articleTagList = new Set([...articleTagList, ...article.tagList]);
  });
  const retData = { tags: Array.from(articleTagList) };
  return mockResPromise(retData);
}

export function getArticleComments(slug) {
  const retComments = [];

  const retData = {
    comments: retComments,
  };

  return mockResPromise(retData);
}

export function getUserProfile(username: string) {
  const matched = userList.find((curUser) => curUser.username === username);

  const retData = {
    profile: {
      username,
      bio: matched?.bio ?? '',
      image: matched?.image ?? '',
      following: false,
    },
  };

  return mockResPromise(retData);
}

export function createUser({ user }) {
  const retUser = {
    ...user,
    id: userList.length,
    token: `--test--${faker.datatype.uuid()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bio: null,
    image: null,
  };

  userList.push(retUser);

  // console.log(`==, mock create ${user} success`);

  const retData = {
    user: retUser,
  };

  return mockResPromise(retData);
}

export function updateUser({ user }) {
  const matchedIndex = userList.findIndex((cur) => cur.email === user.email);
  const matched = userList[matchedIndex];
  const updated = { ...matched, ...user };

  userList[matchedIndex] = updated;

  const retData = {
    user: updated,
  };

  return mockResPromise(retData);
}

export function loginByEmail({ user }) {
  const matchedUser = userList.find((curUser) => curUser.email === user.email);

  const retData = {
    user: matchedUser,
  };

  return mockResPromise(retData);
}

const mockApi = {
  getArticles,
  getArticlesByAuthor,
  getArticlesByTag,
  getArticle,
  createArticle,
  updateArticle,
  getTags,
  getArticleComments,
  createUser,
  updateUser,
  loginByEmail,
  getUserProfile,
};

export default mockApi;
