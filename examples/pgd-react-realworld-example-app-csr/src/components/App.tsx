import * as React from 'react';
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import {
  Provider,
  darkTheme,
  defaultTheme,
  lightTheme,
} from '@adobe/react-spectrum';

import { getCurrentUser } from '../api/AuthAPI';
import useAuth, { AuthProvider } from '../context/auth';
import Article from './Article';
import Editor from './Editor';
import Header from './Header';
import Home from './Home';
import Login from './Login';
import PrivateRoute from './PrivateRoute';
import Profile from './Profile';
import Register from './Register';
import Settings from './Settings';

function App() {
  const {
    state: { user, isAuthenticated },
    dispatch,
  } = useAuth();

  useEffect(() => {
    let ignore = false;

    async function fetchUser() {
      try {
        const payload = await getCurrentUser();
        const { token, ...user } = payload.data.user;
        if (!ignore) {
          dispatch({ type: 'LOAD_USER', user });
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (!user && isAuthenticated) {
      fetchUser();
    }

    return () => {
      ignore = true;
    };
  }, [dispatch, isAuthenticated, user]);

  if (!user && isAuthenticated) {
    return null;
  }

  return (
    // <Provider theme={defaultTheme}>
    // <Provider theme={darkTheme}>
    <AuthProvider>
      <Provider theme={lightTheme}>
        <Router>
          <Header />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='article/:slug' element={<Article />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path=':username' element={<Profile />} />
            <PrivateRoute as={Settings} path='/settings' />
            <PrivateRoute as={Editor} path='/editor' />
            <PrivateRoute as={Editor} path='/editor/:slug' />
          </Routes>
        </Router>
      </Provider>
    </AuthProvider>
  );
}

export default App;
