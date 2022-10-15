import './index.css';

import { importScript } from 'runtime-import';

const change = (msg) => {
  // document.querySelector('root').innerText = msg;
  document.querySelector('#root').innerHTML = `
  <h1>本页面支持热加载 sample-vanilla-es6</h1>
  ${msg}
  <div>
    <input type="text" />
  </div>
  `;
};

document.querySelector('#root').innerText = `
Hello, 热加载!
等待2秒观察内容变化
`;

setTimeout(() => {
  change('Deferred hello world!');
}, 2000);

let jq;
try {
  let { default: jq2 } = await importScript(
    'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.js',
  );

  console.log(';;before');
  console.log(';;jq2', jq2);
  console.log(';;after');
} catch (err) {
  console.error(err);
}

console.log(';;');
