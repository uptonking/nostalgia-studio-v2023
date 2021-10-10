import { transform } from 'buble-jsx-only';
import * as React from 'react';

import { MDXProvider, mdx as createElement } from './mdxjs-react';
import mdxCompile, { ojsToJsx } from './ojs-jsx';

const suffix = `
return React.createElement(
  MDXProvider,
  {components},
  React.createElement(MDXContent, props)
)
`;

export function OjsReactRuntime({
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

  // console.log(';;ojs-children, ', children);

  // ojs-str转jsx
  const jsx = ojsToJsx(children);
  // console.log(';;ojs-jsx, ', jsx);

  // 这里只是将jsx里面的尖括号转换成React.createElement的形式，所以这里不能定制解析转换
  const code = transform(jsx, { objectAssign: 'Object.assign' }).code;

  // console.log(';;ojs-coded, ', code);

  const keys = Object.keys(fullScope);
  const values = Object.values(fullScope);

  // eslint-disable-next-line no-new-func
  const fn = new Function('React', ...keys, `${code}\n\n${suffix}`);

  return fn(React, ...values);
}

export default OjsReactRuntime;
