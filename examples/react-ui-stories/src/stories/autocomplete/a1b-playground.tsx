import '@algolia/autocomplete-theme-classic';

import * as React from 'react';

import { autocomplete } from '@algolia/autocomplete-js';
import { css } from '@linaria/core';

type AutocompleteItem = {
  label: string;
  url: string;
};

export const A1b1AutoInputSimple = () => {
  React.useEffect(() => {
    const autoApi = autocomplete<AutocompleteItem>({
      container: '#autocomplete',
      openOnFocus: true,
      autoFocus: true,

      getSources(params) {
        const { state, setQuery, refresh, setContext } = params;
        console.log(';; getSources-params ', params);

        return [
          {
            sourceId: 'links',
            getItems({ query }) {
              const items = [
                { label: 'GitHub', url: 'https://github.com' },
                { label: 'Zhihu', url: 'https://zhihu.com' },
                { label: 'drawio', url: 'https://draw.io' },
                { label: 'Twitter', url: 'https://twitter.com' },
              ];

              return items.filter(({ label }) =>
                label.toLowerCase().includes(query.toLowerCase()),
              );
            },
            getItemUrl({ item }) {
              return item.url;
            },
            templates: {
              item({ item }) {
                return item.label;
              },
            },
            onSelect: ({ item, setQuery }) => {
              setQuery(item.label);
            },
          },
        ];
      },
    });

    console.log(';; autocomplete api ', autoApi);
  }, []);

  return (
    <div style={{ border: '3px solid #edeff0' }}>
      <div id='autocomplete'></div>
    </div>
  );
};

const rowCss = css`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #bbb;
  line-height: 50px;
`;
