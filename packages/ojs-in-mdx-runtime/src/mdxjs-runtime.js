import { transform } from 'buble-jsx-only';
import * as React from 'react';

import mdxCompile from './mdxjs-mdx';
import { MDXProvider, mdx as createElement } from './mdxjs-react';

const suffix = `
return React.createElement(
  MDXProvider,
  {components},
  React.createElement(MDXContent, props)
)
`;

export function MdxRuntime({
  scope = {},
  components = {},
  remarkPlugins = [],
  rehypePlugins = [],
  children,
  ...props
}) {
  const fullScope = {
    mdx: createElement,
    MDXProvider,
    components,
    props,
    ...scope,
  };

  // console.log(';;code-children, ', children);

  // mdx-str转jsx-str
  const jsx = mdxCompile
    .sync(children, {
      remarkPlugins,
      rehypePlugins,
      skipExport: true,
    })
    .trim();

  // console.log(';;code-jsx, ', jsx);

  // 将jsx-str转换成es5标准的js
  const code = transform(jsx, { objectAssign: 'Object.assign' }).code;
  // const code = transform(jsx).code;
  // const code = jsx;
  // console.log(';;;coded, ', code);

  const keys = Object.keys(fullScope);
  const values = Object.values(fullScope);

  // eslint-disable-next-line no-new-func
  const fn = new Function('React', ...keys, `${code}\n\n${suffix}`);

  return fn(React, ...values);
}

export default MdxRuntime;
