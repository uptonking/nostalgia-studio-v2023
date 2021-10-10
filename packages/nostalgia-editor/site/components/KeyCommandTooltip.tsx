import { Tooltip, Typography } from 'antd';
import * as React from 'react';

interface IKeyCommandTooltipProps {
  children: React.ReactElement;
  command: string;
  title?: string;
}

export default function KeyCommandTooltip({
  children,
  title,
  command,
}: IKeyCommandTooltipProps) {
  return (
    <Tooltip
      title={
        <Typography.Text style={{ color: 'white' }}>
          {title ? `${title}` : ''}
          <Typography.Text style={{ color: 'white' }} keyboard>
            {command}
          </Typography.Text>{' '}
        </Typography.Text>
      }
    >
      {children}
    </Tooltip>
  );
}
