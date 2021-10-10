import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Container, Jumbotron } from 'reactstrap';

export function InternalServerError500(props) {
  const { title = '500 Internal Server Error' } = props;

  return (
    <div>
      <Jumbotron className='min-vh-100 bg-white text-center'>
        <Container>
          <h1 className='display-3 my-5'>{title}</h1>
          <p className='lead text-muted my-3'>
            请联系系统管理员检查服务器是否发生故障，
          </p>
          <p className='lead text-muted mt-3 mb-5'>
            或者点击下面的按钮回到首页
          </p>
          <hr />
          <p className='lead my-5'>
            <NavLink to='/'>
              <Button color='primary' size='lg'>
                回到首页
              </Button>
            </NavLink>
          </p>
        </Container>
      </Jumbotron>
    </div>
  );
}
export default InternalServerError500;
