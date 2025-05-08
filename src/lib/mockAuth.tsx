// src/lib/mockAuth.tsx
'use client';

import type { UserRole } from './constants';
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface MockAuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface MockAuthContextType {
  user: MockAuthUser | null;
  login: (user: MockAuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

const MOCK_USERS: Record<UserRole, MockAuthUser> = {
  guest: { id: 'guest', email: '', fullName: 'Guest', role: 'guest'}, // Should not be used for login
  customer: { id: 'customer1', email: 'customer@example.com', fullName: 'Valued Customer', role: 'customer' },
  worker: { id: 'worker1', email: 'worker@example.com', fullName: 'Dedicated Worker', role: 'worker' },
  admin: { id: 'admin1', email: 'admin@example.com', fullName: 'Site Administrator', role: 'admin' },
};

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage
    const storedUserRole = localStorage.getItem('mockUserRole') as UserRole | null;
    if (storedUserRole && MOCK_USERS[storedUserRole]) {
      setUser(MOCK_USERS[storedUserRole]);
    }
    setIsLoading(false);
  }, []);

  const login = (loggedInUser: MockAuthUser) => {
    setUser(loggedInUser);
    localStorage.setItem('mockUserRole', loggedInUser.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUserRole');
     // For demo, redirect to home or login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };
  
  const loginAs = React.useCallback((role: UserRole) => {
    if (MOCK_USERS[role] && role !== 'guest') {
      login(MOCK_USERS[role]);
      if (typeof window !== 'undefined') {
         setTimeout(() => window.location.reload(), 100);
      }
    } else {
      console.warn(`Cannot login as role: ${role}`);
    }
  }, []); // 'login' is stable and defined in the same scope, not strictly needed in deps

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).mockLoginAs = loginAs;
      (window as any).mockLogout = logout;
    }
  }, [loginAs, logout]);

  const providerValue: MockAuthContextType = { user, login, logout, isLoading };

  return (
    <MockAuthContext.Provider value={providerValue}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}
