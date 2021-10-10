import * as React from 'react';
import { Link } from 'react-router-dom';

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
      </div>
    </div>
  );
}
