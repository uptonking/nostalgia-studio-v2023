var unified = require('unified');
var stream = require('unified-stream');
var markdown = require('remark-parse');
var remark2rehype = require('remark-rehype');
var html = require('rehype-stringify');

var slug = require('remark-slug');
var toc = require('remark-toc');
var doc = require('rehype-document');

// var processor = unified().use(markdown).use(remark2rehype).use(html);

const processor = unified()
  .use(markdown)
  .use(slug)
  .use(toc)
  .use(remark2rehype)
  .use(doc, { title: 'Contents' })
  .use(html);

unified()
  .use(markdown) // Parse markdown content to a syntax tree
  .use(remark2rehype) // Turn markdown syntax tree to HTML syntax tree, ignoring embedded HTML
  .use(html) // Serialize HTML syntax tree
  .process('*emphasis* and **strong**')
  .then((file) => console.log(String(file)))
  .catch((error) => {
    throw error;
  });

// process.stdin.pipe(stream(processor)).pipe(process.stdout);
