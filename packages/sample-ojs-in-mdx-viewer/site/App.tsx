import './assets/onb-inspector-v3.css';

import * as React from 'react';
import { Suspense, lazy, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { MDXProvider } from '@mdx-js/react';

import {
  Accordion,
  Button,
  Item,
  Provider,
  View,
  darkTheme,
  defaultTheme,
  lightTheme,
} from '../src/index';
import { SiteHome } from './SiteHome';
import { CodeBlock } from './components/CodeBlock';
import { CompHome } from './pages/CompHome';

const Wrapper2 = (props) => (
  <main style={{ padding: '20px', backgroundColor: 'white' }} {...props} />
);

// todo 可将多个code block的ojs合并成一个完整的notebook，然后只渲染当前代码块对应的cells
let ojsAllCodeBlocks = [];

const Wrapper = ({ children, ...props }) => {
  // console.log(children.map((child) => child.props.mdxType));
  // console.log(children.map((child) => child));
  children.forEach((child) => {
    if (
      child.props.mdxType === 'pre' &&
      child.props.children.props.ojsLive === 'true'
    ) {
      ojsAllCodeBlocks.push(child.props.children.props.children);
    }
  });
  // console.log(';;ojsAllCodeBlocks, ', ojsAllCodeBlocks);
  return <>{children}</>;
};

const mdxCustomComps = {
  pre: (props) => <div {...props} />,
  code: CodeBlock,
  wrapper: Wrapper,
};

const MdxConfProvider = (props) => (
  <MDXProvider components={mdxCustomComps}>{props.children}</MDXProvider>
);

export function App(props = {}) {
  return (
    // <Provider theme={defaultTheme}>
    // <Provider theme={darkTheme}>
    <Provider theme={lightTheme}>
      <MdxConfProvider>
        <Router>
          {/* <Header /> */}
          <Routes>
            <Route path='/' element={<SiteHome />} />
            <Route path='docs/*' element={<CompHome />} />
          </Routes>
        </Router>
      </MdxConfProvider>
    </Provider>
  );
}

export default App;
