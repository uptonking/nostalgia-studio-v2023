import * as React from 'react';
import { Card, CardBody } from 'reactstrap';

type LoginHelperMessageProps = {
  title?: string;
  testUserLogin?: Function;
  testAdminLogin?: Function;
};

export function LoginHelperMessage(props: LoginHelperMessageProps) {
  const { title = 'ForgotPassword', testUserLogin, testAdminLogin } = props;
  return (
    <div className='pt-5 text-muted'>
      <p>
        帐号1: admin &nbsp; 密码: 111111 &nbsp;&nbsp;说明:
        <span className='cursor-pointer' onClick={testAdminLogin as any}>
          管理员帐号
        </span>
      </p>
      <p>
        帐号2: test &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 密码: 111111
        &nbsp;&nbsp;说明:
        <span className='cursor-pointer' onClick={testUserLogin as any}>
          普通用户
        </span>
      </p>
    </div>
  );
}

export default LoginHelperMessage;
