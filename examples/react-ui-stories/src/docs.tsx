import React, { useState } from 'react';

import * as watarble from '@datalking/watarble/docs/stories/examples-docs';
import { css } from '@linaria/core';
import { AppShell, DisclosureDefault } from '@pgd/ui-react';
import { themed } from '@pgd/ui-tokens';

import * as dndkit from './stories/dnd-kit';
import * as pgdUi from './stories/pgd-ui';
import * as tanstackTable from './stories/tanstack-table';
import * as tanstackVirtual from './stories/tanstack-virtual';

const docsCatalogTitles = {
  watarble: 'watarble table framework',
  pgdUi: 'pgd-ui for react',
  tanstackTable: 'tanstack table',
  tanstackVirtual: 'tanstack virtual',
  dndkit: 'dnd-kit',
};

const docsStoriesByCatalog = {
  watarble,
  pgdUi,
  tanstackTable,
  tanstackVirtual,
  dndkit,
};

const allDocsStories: Record<string, React.FunctionComponent> = {};
for (const [cat, stories] of Object.entries(docsStoriesByCatalog)) {
  for (const [name, doc] of Object.entries(stories)) {
    allDocsStories[name] = doc;
  }
}

// console.log(';; docsStoriesBy ', docsStoriesByCatalog, allDocsStories);

type DocsSidebarProps = {
  onDocChange?: (docName: string) => void;
  // container: HTMLElement;
};

export const DocsSidebar = (props: DocsSidebarProps) => {
  const { onDocChange } = props;
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
              labelClassName={docCatNameCss}
              content={
                <div>
                  {Object.keys(docsStoriesByCatalog[cat] || {}).map((name) => (
                    <div
                      key={name}
                      onClick={() => onDocChange(name)}
                      className={docNameCss}
                    >
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

  const [currDoc, setCurrDoc] = useState(Object.keys(allDocsStories)[0]);
  const CurrDocComp = allDocsStories[currDoc];

  // todo separate pgd-ui docs, cuz it's already in DocPage style
  return (
    <AppShell
      logoContent='Web Playground'
      container={container}
      sidebarContent={<DocsSidebar onDocChange={setCurrDoc} />}
      mainContent={<CurrDocComp />}
    />
  );
};

const docCatNameCss = css`
  background-color: transparent;
  &:hover {
    background-color: ${themed.palette.gray100};
  }
`;

const docNameCss = css`
  display: flex;
  align-items: center;
  padding-left: ${themed.spacing.rem.n2half};
  padding-right: ${themed.spacing.rem.n2half};
  padding-top: ${themed.spacing.rem.n2};
  padding-bottom: ${themed.spacing.rem.n2};
  cursor: pointer;

  &:hover {
    background-color: ${themed.palette.gray100};
  }
`;
