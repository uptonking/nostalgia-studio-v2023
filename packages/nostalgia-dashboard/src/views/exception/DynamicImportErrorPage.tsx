import * as React from 'react';
import { Card, CardBody } from 'reactstrap';

type QuickStartPageProps = {
  title?: string;
  [prop: string]: any;
};

export function DynamicImportErrorPage(props: QuickStartPageProps) {
  const { title = 'Error: Dynamic Import React Components' } = props;
  return (
    <div>
      <h3 className='mb-4'>{title}</h3>
      <Card>
        <CardBody>
          <h1>page for {title}</h1>
          <p>please check your import path</p>
        </CardBody>
      </Card>
    </div>
  );
}

export default DynamicImportErrorPage;
