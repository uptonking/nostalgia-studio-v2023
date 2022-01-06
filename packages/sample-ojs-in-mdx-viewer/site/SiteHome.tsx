import * as React from 'react';
import { Link } from 'react-router-dom';

import ReadmeMdx from '../README.md';
import AccordionMdx from '../src/components/accordion/docs/Accordion.docs.mdx';
import {
  NestedAccordion,
  SimpleAccordion,
  ZendeskStyleAccordion,
} from '../src/components/accordion/stories/Accordion.stories';
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

export function SiteHome(props) {
  return (
    <div style={{ flex: `0 0 auto` }}>
      <div
        style={{
          display: `flex`,
          minHeight: `100vh`,
          flexFlow: `wrap column`,
          // justifyContent: `center`,
          // alignItems: `center`,
        }}
      >
        <h1> ojs in mdx</h1>
        <Link to='/docs'>documentation</Link>
        {/* <h3>Zendesk Style Accordion</h3>
        <ZendeskStyleAccordion />
        <hr style={{ height: 16, border: 'none' }} />
        <h3>Accordion with Nested Data</h3>
        <NestedAccordion /> */}
        <hr style={{ height: 16, border: 'none' }} />
        {/* <Button variant='cta'>测试btn</Button> */}

        <ReadmeMdx />
      </div>
    </div>
  );
}
