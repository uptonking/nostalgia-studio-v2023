import * as React from 'react';

type Props = {
  tooltip: string;
  children: React.ReactNode;
};

/** 基于span简单实现的tooltip提示工具 */
export default function Tooltip({ tooltip, children }: Props) {
  return <span title={tooltip}>{children}</span>;
}
