import React, { type ReactNode } from 'react';

import cx from 'clsx';

import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { Heading, Heading1, Heading2, HeadingLevel } from '../headings';
import { Switch } from '../switch';

type DocPageProps = {
  title?: string;
  desc?: ReactNode;
  previews?: {
    title: string;
    demo: ReactNode;
    /** demo shows at center by default; but sometimes it's useful to show it from top */
    demoNotCenter?: boolean;
    doc?: ReactNode;
  }[];
  usage?: ReactNode;
  props?: ReactNode;
  styles?: ReactNode;
  recommends?: ReactNode;
  notes?: ReactNode;
};

export const docTestData: DocPageProps = {
  title: 'table',
  desc: 'table built with tanstack-table',
  previews: [
    {
      title: 'table with sorting',
      demo: <Switch>enable sort</Switch>,
    },
    { title: 'table with filtering', demo: <Switch>enable filter</Switch> },
    { title: 'table with filtering3', demo: <Switch>enable filter</Switch> },
  ],
};

/**
 * component doc and demo page
 */
export const DocPage = (props: DocPageProps = docTestData) => {
  const { title, previews, usage } = props;
  // console.log(';; page ', title, props);

  return (
    <div>
      <HeadingLevel>
        {title ? <Heading1>{title}</Heading1> : null}
        <div>
          {previews?.map((preview) => {
            const { title: name, demo, demoNotCenter, doc } = preview;
            return (
              <HeadingLevel key={name}>
                <Heading2>{name}</Heading2>
                <div
                  className={cx(demoContainerCss, {
                    [demoNotCenterCss]: demoNotCenter,
                  })}
                >
                  {demo}
                </div>
                {doc ? doc : null}
              </HeadingLevel>
            );
          })}
        </div>
        {usage ? usage : null}
      </HeadingLevel>
    </div>
  );
};

const rootCss = css`
  flex-grow: 1;
  display: flex;
  gap: 24px;
  padding: 32px;
  background-color: #f3f5f7;
  transition: transform ${themed.transition.period.n200} ease;
`;

const titleCss = css`
  margin: ${themed.spacing.rem.n6};
`;

const demoContainerCss = css`
  display: flex;
  justify-content: center;
  align-items: center;
  /* width:100%; */
  min-height: ${themed.spacing.rem.n64};
  /* margin: ${themed.spacing.rem.n6}; */
  border-radius: ${themed.border.radius.xl3};
  background-color: ${themed.palette.gray50};
`;

const demoNotCenterCss = css`
  align-items: start;
  padding-top: ${themed.spacing.rem.n6};
`;
