// const unified = require('unified')
// const remarkParse = require('remark-parse')
// const remarkMdx = require('remark-mdx')
// const squeeze = require('remark-squeeze-paragraphs')
// const minifyWhitespace = require('rehype-minify-whitespace')
// const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
// const mdxHastToJsx = require('./mdx-hast-to-jsx')
import minifyWhitespace from 'rehype-minify-whitespace';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import squeeze from 'remark-squeeze-paragraphs';
import unified from 'unified';

import mdxAstToMdxHast from './mdx-ast-to-mdx-hast';
import mdxHastToJsx from './mdx-hast-to-jsx';

const pragma = `
/* @jsxRuntime classic */
/* @jsx mdx */
/* @jsxFrag mdx.Fragment */
`;

/**
 * 调用unified()的起点，使用的插件依次是remark-parse/remark-mdx/remarkPlugs/mdxAstToMdxHast，
 * 最后返回的的ast是 MdxHast
 * @param {*} options 要使用的remark插件
 * @returns 会计算出MdxHast的处理流程
 */
function createMdxAstCompiler(options = {}) {
  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(squeeze)
    .use(options.remarkPlugins)
    .use(mdxAstToMdxHast);
}

/**
 * 对MdxAst依次使用rehypePlugs/mdxHastToJsx
 */
function createCompiler(options = {}) {
  return createMdxAstCompiler(options)
    .use(options.rehypePlugins)
    .use(minifyWhitespace, { newlines: true })
    .use(mdxHastToJsx, options);
}

function createConfig(mdx, options) {
  const config = { contents: mdx };

  if (options.filepath) {
    config.path = options.filepath;
  }

  return config;
}

/**
 * 开始执行mdx字符串转换成jsx字符串，
 * 与compile()方法功能相同，但执行是同步的，
 */
function sync(mdx, options = {}) {
  const file = createCompiler(options).processSync(createConfig(mdx, options));

  // console.log(';;vfile, ', file);
  return pragma + '\n' + String(file);
}

async function compile(mdx, options = {}) {
  const file = await createCompiler(options).process(
    createConfig(mdx, options),
  );
  return pragma + '\n' + String(file);
}

compile.default = compile;
compile.sync = sync;
compile.createMdxAstCompiler = createMdxAstCompiler;
compile.createCompiler = createCompiler;

// module.exports = compile;
export default compile;
