import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        // No remote public settings to fetch in local mode.
        if (active) setIsLoadingPublicSettings(false);
        const u = await base44.auth.me();
        if (active) setUser(u);
      } catch (e) {
        if (active) setAuthError(null);
      } finally {
        if (active) setIsLoadingAuth(false);
      }
    };
    init();
    return () => { active = false; };
  }, []);

  const navigateToLogin = () => {
    try { base44.auth.redirectToLogin(); } catch { /* no-op locally */ }
  };

  const logout = (redirectUrl) => {
    try { base44.auth.logout(); } catch { /* no-op locally */ }
    setUser(null);
  };

  const recheckAuth = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      setAuthError(null);
    } catch (e) {
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      navigateToLogin,
      logout,
      recheckAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};