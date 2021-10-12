import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';

import type { UserType } from '../common/types';
import CalloutMessageNote from '../components/feedback/callout-message-note';
import * as authService from '../services/authService';
import { useGlobalContext } from '../store';
import {
  AUTHENTICATE_ERROR,
  AUTHENTICATE_SUCCESS,
  LOGOUT,
} from '../store/actions-constants';
import { login } from '../store/user/actions';
import { useMountedState } from '../utils/react-use';
import LoginHelperMessage from '../views/auth/LoginHelperMessage';
import {
  isFormValid,
  validateField,
  validators,
} from '../views/auth/formValidators';

// todo 重写验证规则，如当字段为空时，前端直接提示错误而不会执行请求
export function Login() {
  const navigate = useNavigate();
  const isMounted = useMountedState();

  const {
    // state: { settings },
    dispatch,
  } = useGlobalContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginPwdMemoed, toggleCheckPwdMemoed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateFieldOnInputChange = (fieldName, fieldVal) => {
    validateField(validators, [fieldName], fieldVal);
  };

  const validationErrorsJsx = (fieldName) => {
    const validator = validators[fieldName];
    const result = '';
    if (validator && !validator.valid) {
      const errors = validator.errors.map((info, index) => {
        return (
          <span className='error' key={index}>
            * {info}
            <br />
          </span>
        );
      });
      return <div className='error mb-2'>{errors}</div>;
    }
    return result;
  };

  /**
   * 登录的大致流程，验证用户名密码，返回jwt；
   * 登录成功后，会跳转到首页。
   */
  const handleSubmitLoginForm = useCallback(
    (event) => {
      event.preventDefault();
      // 防止重复提交
      if (isLoading) return;
      if (!username.trim() || !password.trim()) {
        setError('用户名或密码不能为空，请重新输入');
        return;
      }
      // 让提交按钮显示转圈动画
      setIsLoading(true);

      const inputUser = { username, password };

      const ajaxData = async (inputUser: UserType) => {
        try {
          const user: any = await authService.login(inputUser);
          if (isMounted) {
            dispatch(login(user));
            dispatch({ type: AUTHENTICATE_SUCCESS });
            setIsLoading(false);

            console.log(';;user-login-ok, ', user);

            localStorage.setItem('curuser', JSON.stringify(user));

            // todo 默认跳转到from上次访问页或来源页
            navigate('/dashboard');
          }
        } catch (err) {
          console.log(';;user-login-err, ', err);

          if (isMounted) {
            dispatch({ type: LOGOUT });
            dispatch({ type: AUTHENTICATE_ERROR });
            setError(err);
            setIsLoading(false);
          }
        }
      };

      ajaxData(inputUser);
    },
    [dispatch, isLoading, isMounted, navigate, password, username],
  );

  const isSubmitButtonReady = useMemo(() => {
    console.log('is-ready, ', username, password);
    return (
      isFormValid(validators, ['username', 'password']) &&
      username.trim() &&
      password.trim()
    );
  }, [password, username]);
  // console.log('isSubmitButtonReady, ', isSubmitButtonReady);

  const testUserLogin = useCallback(() => {
    setUsername('test');
    setPassword('111111');
    validateFieldOnInputChange('username', 'test');
    validateFieldOnInputChange('password', '111111');
  }, []);
  const testAdminLogin = useCallback(() => {
    setUsername('admin');
    setPassword('111111');
    validateFieldOnInputChange('username', 'admin');
    validateFieldOnInputChange('password', '111111');
  }, []);

  return (
    <div className='page-wrapper auth-wrapper align-items-center d-flex'>
      <div className='container'>
        <div>
          <Row className='no-gutters justify-content-center'>
            <Col md='6' lg='4' className='bg-white'>
              <div className='p-4'>
                <h3 className='font-medium mb-3'>登 录</h3>
                <Form className='mt-3' id='loginForm'>
                  <Label for='username' className='font-medium'>
                    用户名
                  </Label>
                  <InputGroup className='mb-2' size='lg'>
                    <InputGroupAddon addonType='prepend'>
                      <InputGroupText>
                        <i className='fa fa-user-o' />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type='text'
                      id='username'
                      name='username'
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        validateFieldOnInputChange(
                          e.target.name,
                          e.target.value,
                        );
                      }}
                      placeholder='用户名或邮箱'
                    />
                  </InputGroup>
                  {validationErrorsJsx('username')}
                  <Label for='password' className='mt-3 font-medium'>
                    密码
                  </Label>
                  <InputGroup className='mb-3' size='lg'>
                    <InputGroupAddon addonType='prepend'>
                      <InputGroupText>
                        <i className='fa fa-key' />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type='password'
                      id='password'
                      name='password'
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validateFieldOnInputChange(
                          e.target.name,
                          e.target.value,
                        );
                      }}
                      placeholder='不少于6位的密码'
                    />
                  </InputGroup>
                  {validationErrorsJsx('password')}
                  <div className='d-flex no-block align-items-center mb-4 mt-4'>
                    <CustomInput
                      type='checkbox'
                      id='loginPwdMemoed'
                      label='记住密码'
                      checked={isLoginPwdMemoed}
                      onChange={(e) => {
                        toggleCheckPwdMemoed(e.target.checked);
                      }}
                    />
                  </div>
                  <Row className='mb-3'>
                    <Col xs='12'>
                      <Button
                        color='primary'
                        onClick={handleSubmitLoginForm}
                        className={`${
                          isSubmitButtonReady ? '' : 'disabled pointer-disabled'
                        }`}
                        size='lg'
                        type='submit'
                        block
                      >
                        <span className='pr-2'>登录</span>
                        {isLoading && <i className='fa fa-spinner fa-spin' />}
                      </Button>
                    </Col>
                  </Row>
                  {error && (
                    <CalloutMessageNote
                      color='danger'
                      title={<span>登录失败</span>}
                      content={<p>{error}</p>}
                    />
                  )}
                  <div className='text-center'>
                    没有帐号？ <Link to='/register'>去注册</Link>
                  </div>
                  <LoginHelperMessage
                    testUserLogin={testUserLogin}
                    testAdminLogin={testAdminLogin}
                  />
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Login;
