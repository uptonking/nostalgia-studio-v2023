import React, { useCallback, useEffect, useRef, useState } from 'react';

import { faker } from '@faker-js/faker';
import { css } from '@linaria/core';

/** split array to small arrays  */
export const chunkArray = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size),
  );

const Colors = Array(500)
  .fill(0)
  .map((a) => ({ hex: faker.color.rgb() }));

/**
 * ✨ lazy load when the last loading indicator is visible (`rect.top < window.innerHeight`)
 */
export function A5t1LazyList() {
  const [copied, setCopied] = useState('');

  const copyColor = (color) => {
    window.navigator.clipboard.writeText(color);
    showCopiedText(color);
  };

  const showCopiedText = (color) => {
    setCopied(color);
    setTimeout(() => {
      setCopied('');
    }, 800);
  };

  const renderItem = ({ item, index }) => (
    <div
      key={index}
      onClick={() => copyColor(item.hex)}
      className={itemCss}
      style={{ backgroundColor: item.hex }}
    >
      <div className='copy'>{item.hex}</div>
    </div>
  );

  return (
    <main>
      <h1>Random 500 Colors</h1>

      <h4>
        example for{' '}
        <a href='https://github.com/omer73364/lazy-load-list' target='blank'>
          lazy load list
        </a>
        on React js
      </h4>

      {copied ? (
        <h4 className='cpoied'>{`Color ${copied} copied to clipboard`}</h4>
      ) : null}

      <div className={containerCss}>
        <LazyList
          data={Colors}
          itemsPerRender={15}
          containerClasses={scrollableCss}
          defaultLoadingColor='#222'
          renderItem={renderItem}
        />
      </div>
    </main>
  );
}

/**
 * forked from https://github.com/omer73364/lazy-load-list /MIT/202202/js
 */
export const LazyList = (props) => {
  const {
    renderItem = () => null,
    loadingComponent = () => null,
    data = [],
    itemsPerRender = 3,
    containerClasses = '',
    defaultLoading = true,
    defaultLoadingColor = '#18191A',
  } = props;

  const containerRef = useRef<HTMLDivElement>();
  const endOfListRef = useRef<HTMLDivElement>();

  const [loading, setLoading] = useState(false);

  // page represents the index of last rendered small array in the list
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [itemsToDisplay, setItemsToDisplay] = useState([]); // the list of items to be rendered
  window['items'] = items;
  window['items1'] = itemsToDisplay;

  /** set items to display, only exec onMount */
  const updateList = useCallback(() => {
    const items1 = chunkArray(data, itemsPerRender);
    setItems(items1); // chunkArray(data,itemsPerRender) to get array of small arrays
    setItemsToDisplay(items1[0]);
  }, [data, itemsPerRender]);

  useEffect(
    // only exec onMount
    () => {
      // console.log(';; init ');
      updateList();
    },
    [updateList],
  );

  // load more items when scrolling to the end of the list
  const loadItems = useCallback(() => {
    if (page === items.length - 1) return;

    const element = endOfListRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // console.log(
    //   ';; load ',
    //   loading,
    //   page,
    //   rect.top,
    //   rect.bottom,
    //   window.innerHeight,
    // );

    // load again until the loading indicator is visible
    if (
      page < items.length &&
      rect.bottom <= window.innerHeight &&
      rect.top >= 0 &&
      !loading
    ) {
      // if (page < items.length && !loading) {
      setLoading(true);
      setPage(page + 1);

      setTimeout(() => {
        console.log(';; fetching ');
        setItemsToDisplay([...itemsToDisplay, ...items[page + 1]]);
        setLoading(false);
        // 👇🏻 recursively load all items
        // loadItems();
      }, 1500);
    }
  }, [items, itemsToDisplay, loading, page]);

  useEffect(() => {
    loadItems();
    const containerElem = containerRef.current;
    containerElem.addEventListener('scroll', loadItems);

    return () => {
      containerElem?.removeEventListener('scroll', loadItems);
    };
  }, [loadItems]);

  console.log(';; visible ', itemsToDisplay.length);
  return (
    <div ref={containerRef} className={containerClasses.toString()}>
      {/* <!-- items rendering --> */}
      {itemsToDisplay.map((item, index) => renderItem({ item, index }))}

      {loading ? (
        defaultLoading ? (
          <div id='loading-wrapper'>
            <h3>Loading</h3>
          </div>
        ) : (
          <div id='loading-wrapper'>{loadingComponent()}</div>
        )
      ) : null}

      {/* <!-- list footer --> */}
      <div
        className={page === items.length - 1 || loading ? displayNoneCss : ''}
        id='end-of-list'
        ref={endOfListRef}
      />
    </div>
  );
};

const containerCss = css`
  width: 400px;
  height: 400px;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;

  #end-of-list {
    height: 32px;
    width: 100%;
  }
`;

const scrollableCss = css`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
`;

const itemCss = css`
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 80px;
  margin: 12px;
  border-radius: 12px;
  cursor: pointer;
`;

const displayNoneCss = css`
  display: none;
`;
