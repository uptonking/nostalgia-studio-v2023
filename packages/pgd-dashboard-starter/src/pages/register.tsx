import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Button,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Input,
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
import {
  isFormValid,
  validateField,
  validators,
} from '../views/auth/formValidators';

type RegisterProps = {
  title?: string;
};

export function Register(props: RegisterProps) {
  const navigate = useNavigate();
  const isMounted = useMountedState();

  const {
    // state: { settings },
    dispatch,
  } = useGlobalContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegisterTermsAccepted, setIsRegisterTermsAccepted] = useState(false);

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
   * 注册的大致流程，服务端生成id、返回除密码外的其他用户信息，返回 jwt token；
   * 用户注册成功后会直接跳转到首页，而不会到登录页。
   */
  const handleSubmitRegisterForm = useCallback(
    async (event) => {
      event.preventDefault();
      if (isLoading) return;
      if (!username.trim() || !password.trim()) {
        setError('用户名或密码不能为空，请重新输入');
        return;
      }
      if (!isRegisterTermsAccepted) {
        setError('请同意服务条款');
        return;
      }
      setIsLoading(true);

      const inputUser = { username, password, email };

      const ajaxData = async (inputUser: UserType) => {
        try {
          const user: any = await authService.register(inputUser);
          if (isMounted) {
            dispatch(login(user));
            dispatch({ type: AUTHENTICATE_SUCCESS });
            setIsLoading(false);

            console.log(';;user-register-ok, ', user);

            localStorage.setItem('curuser', JSON.stringify(user));

            // todo 默认跳转到from上次访问页或来源页
            navigate('/dashboard');
          }
        } catch (err) {
          console.log(';;user-register-err, ', err);

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
    [
      dispatch,
      email,
      isLoading,
      isMounted,
      isRegisterTermsAccepted,
      navigate,
      password,
      username,
    ],
  );

  const isSubmitButtonReady = useMemo(() => {
    return (
      isRegisterTermsAccepted &&
      isFormValid(validators, ['username', 'password']) &&
      username.trim() &&
      password.trim()
    );
  }, [isRegisterTermsAccepted, password, username]);

  return (
    <div className='page-wrapper auth-wrapper  align-items-center d-flex'>
      <div className='container'>
        <div>
          <Row className='no-gutters justify-content-center'>
            <Col md='6' lg='4' className='bg-white'>
              <div className='p-4'>
                <h3 className='font-medium mb-3'>注 册</h3>

                {/* <Form className='mt-3' id='loginform' action='/dashboard'> */}
                <Form className='mt-3' id='registerForm'>
                  <FormGroup className='mb-3'>
                    <Label for='username' className='font-medium'>
                      用户名 *
                    </Label>
                    <Input
                      type='text'
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        validateFieldOnInputChange(
                          e.target.name,
                          e.target.value,
                        );
                      }}
                      name='username'
                      id='username'
                      placeholder='支持字母、数字，如 baoyu123'
                      bsSize='lg'
                    />
                  </FormGroup>
                  {validationErrorsJsx('username')}
                  <FormGroup className='mb-3'>
                    <Label for='email' className='font-medium'>
                      邮箱
                    </Label>
                    <Input
                      type='email'
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateFieldOnInputChange(
                          e.target.name,
                          e.target.value,
                        );
                      }}
                      name='email'
                      id='email'
                      placeholder='如 baoyu123@qq.com'
                      bsSize='lg'
                    />
                  </FormGroup>
                  {validationErrorsJsx('email')}
                  <FormGroup className='mb-3'>
                    <Label for='password' className='font-medium'>
                      密码 *
                    </Label>
                    <Input
                      type='password'
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validateFieldOnInputChange(
                          e.target.name,
                          e.target.value,
                        );
                      }}
                      name='password'
                      id='password'
                      placeholder='长度至少6位以上'
                      bsSize='lg'
                    />
                  </FormGroup>
                  {validationErrorsJsx('password')}
                  <CustomInput
                    type='checkbox'
                    id='acceptTermsAndLicenses'
                    label='同意《服务条款》'
                    checked={isRegisterTermsAccepted}
                    onChange={(e) => {
                      setIsRegisterTermsAccepted(e.target.checked);
                    }}
                  />
                  <Row className='mb-3 mt-3'>
                    <Col xs='12'>
                      <Button
                        onClick={handleSubmitRegisterForm}
                        className={`text-uppercase ${
                          isSubmitButtonReady ? '' : 'disabled pointer-disabled'
                        }`}
                        color='primary'
                        size='lg'
                        type='submit'
                        block
                      >
                        <span className='pr-2'>注册</span>
                        {isLoading && <i className='fa fa-spinner fa-spin' />}
                      </Button>
                    </Col>
                  </Row>
                  {error && (
                    <CalloutMessageNote
                      color='danger'
                      title={<span>注册失败</span>}
                      content={<p>{error}</p>}
                    />
                  )}
                  <div className='text-center'>
                    已有帐号？ <Link to='/login'>去登录</Link>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Register;
