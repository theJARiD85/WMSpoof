import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { account } from '../lib/appwrite';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let mounted = true; // avoid setting state after unmount

  const checkAuth = async () => {
    try {
      const res = await account.get(); // Appwrite: throws on invalid session

      // If your API *does* return a { status: false } shape, handle it:
      const invalid =
        !res || res.status === false || !res.$id;

      if (!mounted) return;

      if (invalid) {
        setUser(null);
      } else {
        setUser({ id: res.$id, email: res.email, name: res.name });
      }
    } catch (err) {
      // Appwrite will throw on expired/missing session
      if (mounted) {
        console.log('Session expired or not found');
        setUser(null);
      }
    } finally {
      if (mounted) setLoading(false);
    }
  };

  checkAuth(); // Initial check
  const interval = setInterval(checkAuth, 10000); // every 60s

  return () => {
    mounted = false;
    clearInterval(interval);
  };
}, []);

  useEffect(() => {
  const checkSession = async () => {
    try {
      const session = await account.getSession('current');
      if (session) {
        const currentUser = await account.get();
        setUser(currentUser);
      }
    } catch (err) {
      console.log('No active session');
    } finally {
      setLoading(false);
    }
  };
  checkSession();
}, []);

  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession({ email, password });
      const me = await account.get();
      await SecureStore.setItemAsync('userId', me.$id);
      setUser({ id: me.$id, email: me.email, name: me.name });
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      // Optionally, set an error state here to provide user feedback
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession({ sessionId: 'current' });
      await SecureStore.deleteItemAsync('userId');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);