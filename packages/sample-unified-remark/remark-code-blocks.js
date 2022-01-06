const codeblocks = (tree, options) => {
  options = options || {};

  // console.log('args-tree', JSON.stringify(tree));
  // console.log('args-options', JSON.stringify(options));

  const lang = options.lang || 'all';
  const name = options.name || 'codeblocks';
  const formatter = options.formatter || ((v) => v);

  const { children } = tree;
  let data = {};
  let child;
  let i = -1;

  if (lang === 'all') {
    data[name] = {};
  } else {
    data[name] = [];
  }

  while (++i < children.length) {
    child = children[i];

    if (child.type === 'code' && child.value) {
      if (lang === 'all') {
        child.lang = child.lang || '_';
        data[name][child.lang] = data[name][child.lang] || [];
        data[name][child.lang].push(formatter(child.value));
      } else {
        if (child.lang === lang) {
          data[name].push(formatter(child.value));
        }
      }
    }
  }

  return data;
};

// module.exports = (options) => (tree, file) => {
const rCodeBlocks = (options) => (tree, file) => {
  const data = codeblocks(tree, options);
  file.data = Object.assign({}, file.data, data);
};

// module.exports.codeblocks = (tree, options) => codeblocks(tree, options);

const parser = require('remark-parse');
const stringify = require('remark-stringify');
const unified = require('unified');
const toVFile = require('to-vfile');

// const codeblocks = require('..');

unified()
  .use(parser)
  .use(stringify)
  .use(rCodeBlocks, { lang: 'js' })
  .process(toVFile.readSync('./readme.md'))
  .then((file) => {
    const code = file.data.codeblocks.join('\n');
    console.log(code);
  });
