import { useState, useCallback } from 'react';

export type User = {
  email: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string, rememberMe: boolean) => {
    // Accept any credentials for now
    setUser({ email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return { user, login, logout };
} 