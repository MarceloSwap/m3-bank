import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import api, { setApiToken, setApiUnauthorizedHandler } from '../lib/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'm3-bank-auth';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedSession = window.localStorage.getItem(STORAGE_KEY);

    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      setSession(parsed);
      setApiToken(parsed.token);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setApiUnauthorizedHandler(() => {
      logout();
      router.replace('/');
    });
  }, [router]);

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    const nextSession = {
      token: data.token,
      user: data.user,
      account: data.account
    };

    setSession(nextSession);
    setApiToken(nextSession.token);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));

    return data;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }

  async function refreshAccount() {
    const [{ data: accountData }, { data: statementData }] = await Promise.all([
      api.get('/accounts/me'),
      api.get('/accounts/statement', { params: { page: 1, limit: 5, periodDays: 30 } })
    ]);

    const nextSession = {
      ...session,
      user: {
        ...session.user,
        name: accountData?.owner?.name || session.user?.name,
        email: accountData?.owner?.email || session.user?.email
      },
      account: {
        ...session.account,
        id: accountData.id,
        number: accountData.number,
        digit: accountData.digit,
        balance: accountData.balance
      }
    };

    setSession(nextSession);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));

    return {
      account: accountData,
      statement: statementData
    };
  }

  function logout() {
    setSession(null);
    setApiToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      session,
      loading,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      refreshAccount,
      logout
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
