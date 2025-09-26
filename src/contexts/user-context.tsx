
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Plan, User } from '@/lib/types';
import { getUserByEmail, mockAdminUser } from '@/lib/data';
import { addUser } from '@/app/actions';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: (plan?: Plan) => Promise<void>;
  signInWithMicrosoft: (plan?: Plan) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user
    const checkUser = async () => {
      setLoading(true);
      // In a real app, you'd check a token in localStorage
      // For this mock, we'll just set the admin user as the default logged in user
      setCurrentUser(mockAdminUser);
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    // This is a mock login. In a real app, you'd call an auth provider.
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserByEmail(email);
    if (user) {
      setCurrentUser(user);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };
  
  const signInWithProvider = async (plan: Plan = 'starter') => {
    // Mock signing in with a provider
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentUser(mockAdminUser);
    setLoading(false);
  }

  const signInWithGoogle = async (plan: Plan = 'starter') => {
    await signInWithProvider(plan);
  }

  const signInWithMicrosoft = async (plan: Plan = 'starter') => {
    await signInWithProvider(plan);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentUser(null);
    setLoading(false);
    router.push('/login');
  };
  
  const updateCurrentUser = useCallback((userData: Partial<User>) => {
    if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
    }
  }, [currentUser]);


  return (
    <UserContext.Provider value={{ currentUser, loading, login, signInWithGoogle, signInWithMicrosoft, logout, updateCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

    