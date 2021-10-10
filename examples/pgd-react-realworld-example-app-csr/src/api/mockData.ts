import faker from 'faker';

const userNum = 13;
const articleNum = 166;

export let userList = new Array(userNum).fill(0).map((item, index) => ({
  id: index,
  username: `testuser${index}`,
  email: `testuser${index}@gmail.com`,
  token: `jwt-token-${index}`,
  bio: faker.name.jobTitle(),
  image: faker.image.avatar(),
}));

export function getUserByUsername(username) {
  return userList.find((user) => user.username === username);
}

export let articleList = new Array(articleNum).fill(0).map((item, index) => {
  const articleContent = faker.lorem.paragraphs();

  return {
    // slug: `article-id-${index}`,
    slug: faker.lorem.slug(),
    title: `${index}-${faker.lorem.words()}`,
    description: `${articleContent.slice(0, 96)}...`,
    body: articleContent,
    tagList: [faker.name.jobType(), faker.name.jobArea()],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    favorited: false,
    favoritesCount: 0,
    author: {
      ...getUserByUsername(`testuser${randomIntBetween(0, userNum - 1)}`),
      following: false,
    },
    // author1: {
    //   username: `testuser${randomIntBetween(0, userNum - 1)}`,
    //   bio: 'work at statefarm',
    //   image: 'https://cdn.fakercloud.com/avatars/kvasnic_128.jpg',
    //   following: false,
    // },
  };
});

export let commentList = new Array(articleNum * 3)
  .fill(0)
  .map((item, index) => ({
    id: index,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    body: 'It takes a Jacobian',
    author: {
      ...getUserByUsername(`testuser${randomIntBetween(0, userNum - 1)}`),
      following: false,
    },
    // author1: {
    //   username: 'jake',
    //   bio: 'I work at statefarm',
    //   image: 'https://i.stack.imgur.com/xHWG8.jpg',
    //   following: false,
    // },
  }));

function randomIntBetween(min = 1, max = 1000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
