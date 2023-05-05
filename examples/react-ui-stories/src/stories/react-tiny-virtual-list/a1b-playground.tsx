import * as React from 'react';

import {
  type ItemStyle,
  ScrollAlignment,
  ScrollDirection,
  VirtualList,
} from 'react-tiny-virtual-list';

import { css } from '@linaria/core';

const STICKY_INDICES = [0, 5, 8, 15, 30, 50, 100, 200];
const ITEM_HEIGHT = 50;
const ITEM_STYLE: React.CSSProperties = {
  padding: '12px 20px',
  boxSizing: 'border-box',
  fontFamily: 'system-ui, "Helvetica Neue", Helvetica, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
};

const renderItem = ({ style, index }: { style: ItemStyle; index: number }) => {
  const isSticky = STICKY_INDICES.includes(index);
  const itemStyle = isSticky
    ? { ...style, ...ITEM_STYLE, backgroundColor: '#f2f4f8' }
    : { ...style, ...ITEM_STYLE };
  return (
    <div style={itemStyle} key={index}>
      Row #{index} {isSticky ? '(Sticky)' : ''}
    </div>
  );
};

export const A1b1ListSimple = () => {
  const renderItem = ({
    style,
    index,
  }: {
    style: ItemStyle;
    index: number;
  }) => {
    return (
      <div className={rowCss} style={style} key={index}>
        Row #{index}
      </div>
    );
  };

  return (
    <div style={{ border: '3px solid #edeff0' }}>
      <VirtualList
        width='auto'
        height={400}
        itemCount={1000}
        renderItem={renderItem}
        itemSize={40}
        className={listCss}
        overscanCount={2}
      />
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

const listCss = css`
  margin: 20px;
  background: whitesmoke;
  border-radius: 2px;
`;

export const A1b1ListSimpleIssue = () => (
  <div style={{ border: '3px solid #edeff0' }}>
    <VirtualList
      width='auto'
      height={400}
      itemCount={1000}
      renderItem={renderItem}
      itemSize={ITEM_HEIGHT}
      // 👀
      // stickyIndices={[]}
      scrollDirection={ScrollDirection.VERTICAL}
      overscanCount={3}
    />
  </div>
);

export const A1b2ListSticky = () => (
  <div style={{ border: '3px solid #edeff0' }}>
    <VirtualList
      width='auto'
      height={400}
      itemCount={1000}
      renderItem={renderItem}
      itemSize={ITEM_HEIGHT}
      stickyIndices={STICKY_INDICES}
      scrollDirection={ScrollDirection.VERTICAL}
      overscanCount={5}
    />
  </div>
);

export const A1b3Controlled = () => {
  const [index, setIndex] = React.useState<number | null>(null);
  const setNewIndex = React.useCallback((index) => {
    setIndex(null);
    setTimeout(() => setIndex(index));
  }, []);

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setNewIndex(5)}>Scroll to 5</button>
        &nbsp;
        <button onClick={() => setNewIndex(15)}>Scroll to 15</button>
        &nbsp;
        <button onClick={() => setNewIndex(30)}>Scroll to 30</button>
      </div>
      <div style={{ border: '3px solid #edeff0' }}>
        <VirtualList
          width='auto'
          height={400}
          itemCount={1000}
          renderItem={renderItem}
          itemSize={ITEM_HEIGHT}
          stickyIndices={STICKY_INDICES}
          scrollToIndex={index !== null ? index : undefined}
          scrollDirection={ScrollDirection.VERTICAL}
          overscanCount={5}
        />
      </div>
    </>
  );
};

export const A1b4AlignSmart = () => {
  const [index, setIndex] = React.useState<number | null>(null);
  const setNewIndex = React.useCallback((index) => {
    setIndex(null);
    setTimeout(() => setIndex(index));
  }, []);

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setNewIndex(5)}>Scroll to 5</button>
        &nbsp;
        <button onClick={() => setNewIndex(15)}>Scroll to 15</button>
        &nbsp;
        <button onClick={() => setNewIndex(30)}>Scroll to 30</button>
      </div>
      <div style={{ border: '3px solid #edeff0' }}>
        <VirtualList
          width='auto'
          height={400}
          itemCount={1000}
          renderItem={renderItem}
          itemSize={ITEM_HEIGHT}
          stickyIndices={STICKY_INDICES}
          scrollToIndex={index !== null ? index : undefined}
          scrollDirection={ScrollDirection.VERTICAL}
          // 👇🏻
          scrollToAlignment={ScrollAlignment.SMART}
          overscanCount={5}
        />
      </div>
    </>
  );
};
