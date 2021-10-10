import * as React from 'react';
import { Suspense, lazy, useState } from 'react';

// import MdxRuntime from '@mdx-js/runtime';
import { MdxRuntime, OjsReactRuntime } from '@datalking/ojs-in-mdx-runtime';
import { Inspector, Runtime } from '@observablehq/runtime';

// Custom components:
const components = {
  h1: (props) => <h1 style={{ color: 'red' }} {...props} />,
  Demo: () => <p>This is a demo component</p>,
};

const onbRuntime = new Runtime();
// console.log(';;onbRuntime', onbRuntime);

// Data available in MDX:
const scope = {
  somethingInScope: 1,
  onbRuntime,
  Inspector,
};

export function CodeBlock(props) {
  const { ojsLive, jsxLive, children } = props;

  if (ojsLive) {
    return (
      <OjsReactRuntime components={components} scope={scope}>
        {children}
      </OjsReactRuntime>
    );
  }

  if (jsxLive) {
    return (
      <MdxRuntime components={components} scope={scope}>
        {children}
      </MdxRuntime>
    );
  }

  return <pre style={{ color: ojsLive ? 'green' : 'pink' }} {...props} />;
}

export default CodeBlock;
