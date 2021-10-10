import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Button,
  Flex,
  Form,
  Grid,
  Heading,
  Text,
  TextField,
  View,
} from '@adobe/react-spectrum';

import { register } from '../api/AuthAPI';
import useAuth from '../context/auth';
import { IErrors } from '../types';
import ListErrors from './common/ListErrors';

export default function Register(_) {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<IErrors | null>(null);
  const {
    state: { user },
    dispatch,
  } = useAuth();

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    // const { username, email, password } = form;
    try {
      const user = await register({ username, email, password });
      dispatch({ type: 'LOAD_USER', user });
      navigate('/');
    } catch (error) {
      console.log(error);
      setLoading(false);
      if (error.status === 422) {
        setErrors(error.data.errors);
      }
    }
  };

  useEffect(() => {
    if (user) {
      // return <Redirect to='/' noThrow />;
      navigate('/');
    }
  }, [navigate, user]);

  return (
    <View UNSAFE_style={{}}>
      <View
        UNSAFE_style={{
          width: `32%`,
          margin: `0 auto`,
          // backgroundColor: 'beige',
        }}
      >
        <Grid justifyContent='center'>
          <View>
            <Heading level={2}>Sign up</Heading>
          </View>
          <View>
            <Link to='/login'>Already have an account?</Link>
          </View>
        </Grid>

        <View marginTop='size-200'>
          {errors && <ListErrors errors={errors} />}
        </View>
        <Form
          method='post'
          onSubmit={handleSubmit}
          labelPosition='top'
          labelAlign='start'
        >
          <TextField
            value={username}
            onChange={setUsername}
            name='username'
            label='User Name'
            placeholder='input name will be checked for uniqueness'
          />
          <TextField
            value={email}
            onChange={setEmail}
            name='email'
            label='Email'
            placeholder='name@email.com'
          />
          <TextField
            value={password}
            onChange={setPassword}
            name='password'
            label='Password'
            placeholder='length must be 8 or greater'
          />
          <Button
            variant='cta'
            type='submit'
            minWidth='size-1200'
            marginTop='size-400'
            UNSAFE_style={{
              width: '25%',
              // marginLeft: `auto`
            }}
          >
            Sign Up
          </Button>
        </Form>
      </View>
    </View>
  );
}
