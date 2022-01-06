import React, { forwardRef, useCallback, useState } from 'react';
import styled from 'styled-components';

import { UIProps } from '..';

interface IProps {
  className?: string;
  initialProps: UIProps;
  /** 每次props变化时，都会接受新PMNode相关数据，并执行这个方法，一般执行effects */
  useListenProps: (cb: (newProps: UIProps) => void) => void;
}

/** react组件，可以包含与prosemirror无关的状态，
 * 可以通过commands触发执行dispatch，然后更新所有ReactNodeView组件来实现更新本组件自身的目的；
 * 甚至可以触发一个空transaction只更新所有ReactNodeViews，不更新prosemirror-state和pm-view;
 * 可参考原repo的Toolbar.tsx示例，使用useEditorContext()+toggleMark，更新了pm-view和所有ReactNodeViews
 */
export const BlockQuote = forwardRef((props: IProps, ref: any) => {
  const { className, initialProps, useListenProps } = props;

  const [count, setCount] = useState(0);

  /** 测试state变化，依次打印0，1，2... */
  const handleClickCount = useCallback(() => {
    setCount((c) => c + 1);
    console.log('clicked-bq, ', count);
  }, [count]);

  function handleUpdate(newProps: any) {
    console.log(
      ';;BlockQuote-ReactNView rendering，可以将setState注册到这里, ',
      newProps,
    );
  }

  useListenProps(handleUpdate);

  const [attrs, setAttrs] = useState({ ...initialProps.attrs });

  return (
    <StyledBlockQuote
      onClick={handleClickCount}
      className={className}
      ref={ref}
    />
  );
});

export const StyledBlockQuote = styled.blockquote`
  box-sizing: border-box;
  /* color: #6a737d; */
  color: coral;
  padding: 0 1em;
  border-left: 4px solid #dfe2e5;
  margin: 0.2rem 0 0 0;
  margin-right: 0;

  [dir='rtl'] & {
    padding-left: 0;
    padding-right: 4px;
  }

  &:first-child {
    margin-top: 0;
  }

  &::before {
    content: '';
  }

  &::after {
    content: none;
  }

  & p {
    display: block;
  }

  & table,
  & table:last-child {
    display: inline-table;
  }
`;
