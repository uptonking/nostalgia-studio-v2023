import * as React from 'react';

type QuickStartPageProps = {
  title?: string;
};

export function ForgotPassword(props: QuickStartPageProps) {
  const { title = 'ForgotPassword' } = props;
  return (
    <div>
      <h3 className='mb-4'>{title}</h3>
      <p>A quick start page for {title}</p>
    </div>
  );
}

export default ForgotPassword;
