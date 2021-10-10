import * as React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';

export const Feeds = () => {
  return (
    <Card>
      <CardBody>
        <CardTitle>Feeds</CardTitle>
        <div className='feed-widget'>
          <ul className='list-style-none feed-body m-0 pb-3'>
            <li className='feed-item'>
              <div className='feed-icon bg-info'>
                <i className='far fa-bell' />
              </div>{' '}
              You have 4 pending tasks.{' '}
              <span className='ml-auto font-12 text-muted'>Just Now</span>
            </li>
            <li className='feed-item'>
              <div className='feed-icon bg-success'>
                <i className='ti-server' />
              </div>{' '}
              Server #1 overloaded.
              <span className='ml-auto font-12 text-muted'>2 Hours ago</span>
            </li>
            <li className='feed-item'>
              <div className='feed-icon bg-warning'>
                <i className='ti-shopping-cart' />
              </div>{' '}
              New order received.
              <span className='ml-auto font-12 text-muted'>31 May</span>
            </li>
            <li className='feed-item'>
              <div className='feed-icon bg-danger'>
                <i className='ti-user' />
              </div>{' '}
              New user registered.
              <span className='ml-auto font-12 text-muted'>30 May</span>
            </li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
};

export default Feeds;
