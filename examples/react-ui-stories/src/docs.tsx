import React, { useState } from 'react';

import {
  AppShell,
  DisclosureContent,
  DisclosureDefault,
  DocPage,
  useDisclosureStore,
} from '@pgd/ui-react';

import * as pgdUi from './stories/pgd-ui';
import * as tanstackTable from './stories/tanstack-table';

const docsStoriesByCatalog = {
  pgdUi,
  tanstackTable,
};

const allDocsStories: Record<string, React.FunctionComponent> = {};
for (const [cat, stories] of Object.entries(docsStoriesByCatalog)) {
  for (const [name, doc] of Object.entries(stories)) {
    allDocsStories[name] = doc;
  }
}

console.log(';; docsStoriesBy ', docsStoriesByCatalog, allDocsStories);

const docsCatalogTitles = {
  pgdUi: 'pgd-ui-react',
  tanstackTable: 'tanstack table',
};

type DocsSidebarProps = {
  // container: HTMLElement;
};

export const DocsSidebar = (props: DocsSidebarProps) => {
  return (
    <div>
      {Object.keys(docsCatalogTitles).map((cat) => {
        // console.log(
        //   ';; cat ',
        //   cat,
        //   docsStoriesByCatalog[cat],
        //   Object.keys(docsStoriesByCatalog[cat] || {}),
        // );

        return (
          <div key={cat}>
            <DisclosureDefault
              defaultOpen={true}
              label={docsCatalogTitles[cat]}
              content={
                <div>
                  {Object.keys(docsStoriesByCatalog[cat] || {}).map((name) => (
                    <div key={name} onClick={() => {}}>
                      {name}
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        );
      })}
    </div>
  );
};

type DocsStoriesProps = {
  /** container element is required for AppShell to fill its height. */
  container: HTMLElement;
};

export const DocsStories = (props: DocsStoriesProps) => {
  const { container } = props;

  const currDoc = useState(Object.keys(allDocsStories)[0]);

  return (
    <AppShell
      container={container}
      sidebarContent={<DocsSidebar />}
      mainContent={currDoc + ''}
    />
  );
};
