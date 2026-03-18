'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // For demo purposes, we're not using persistent storage as requested by the user.
    // However, in a real app, we'd check for a token in sessionStorage/localStorage/cookies.
    // Since we're keeping it in memory, if the page refreshes, the user is logged out.
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  // Basic route protection
  useEffect(() => {
    if (!isLoading && !token && pathname === '/dashboard') {
      router.push('/login');
    }
  }, [isLoading, token, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
