import * as React from 'react';
import { Card, CardBody } from 'reactstrap';

type QuickStartPageProps = {
  title?: string;
  tips?: string | React.ReactElement;
};

export function QuickStartPage(props: QuickStartPageProps) {
  const {
    title = 'starter/quickstart.tsx',
    tips = 'hello, u can replace this template page',
  } = props;
  return (
    <div>
      <h4 className='mb-4'>{title}</h4>
      <Card>
        <CardBody>{typeof tips !== 'string' ? tips : <h3>{tips}</h3>}</CardBody>
      </Card>
    </div>
  );
}

export default QuickStartPage;
