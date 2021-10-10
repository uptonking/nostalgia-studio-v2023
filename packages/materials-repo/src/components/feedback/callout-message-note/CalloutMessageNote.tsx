import './index.scss';

import React from 'react';
import { Alert } from 'reactstrap';

type CalloutMessageNoteProps = {
  title?: React.ReactNode;
  content?: React.ReactNode;
  color?: 'light' | 'danger' | 'success';
};

export function CalloutMessageNote(props: CalloutMessageNoteProps) {
  const { title, content, color = 'light' } = props;

  return (
    <div className={`callout callout-${color}`}>
      <h4 className={`text-${color === 'light' ? 'dark' : color}`}>{title}</h4>
      <Alert color={color} className='mb-1'>
        {content}
      </Alert>
    </div>
  );
}

export default CalloutMessageNote;
