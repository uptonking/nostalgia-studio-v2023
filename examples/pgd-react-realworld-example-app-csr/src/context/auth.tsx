import * as React from 'react';
import { createContext, useContext, useEffect, useReducer } from 'react';

import {
  TOKEN_KEY,
  isTokenValid,
  isTokenValidForTest,
  setToken,
} from '../api/APIUtils';
import { logout } from '../api/AuthAPI';
import {
  AuthAction,
  AuthState,
  authReducer,
  initialState,
} from '../reducers/auth';
import { getLocalStorageValue } from '../utils';

type AuthContextProps = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
};

const AuthContext = createContext<AuthContextProps>({
  state: initialState,
  dispatch: () => initialState,
});

export function AuthProvider(props: React.PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = getLocalStorageValue(TOKEN_KEY);
    console.log('==AuthProvider-token, ', token);

    if (!token) return;

    if (isTokenValidForTest(token)) {
      console.log('==isTokenValidForTest');
      setToken(token);
      dispatch({ type: 'LOGIN' });
    }

    if (isTokenValid(token)) {
      setToken(token);
      dispatch({ type: 'LOGIN' });
    } else {
      dispatch({ type: 'LOGOUT' });
      logout();
    }
  }, []);

  return <AuthContext.Provider value={{ state, dispatch }} {...props} />;
}

export default function useAuth() {
  return useContext(AuthContext);
}
