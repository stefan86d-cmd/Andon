
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Plan, User } from '@/lib/types';
import { getUserByEmail } from '@/lib/data';
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
    // This simulates checking for a logged-in user on app start.
    // In a real app, you would verify a token from localStorage/cookies.
    // We are now starting with no user logged in.
    setLoading(true);
    setCurrentUser(null);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    // This function now simulates a failed login as mock data is gone.
    // It is ready to be implemented with a real authentication provider.
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserByEmail(email); // Will return null
    if (user) {
      setCurrentUser(user);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };
  
  const signInWithProvider = async (plan: Plan = 'starter') => {
    // This function is ready for a real provider implementation.
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real implementation, you would get user data from the provider
    // and then create/update the user in your database.
    // For now, we do nothing.
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
    // This function is ready for a real provider implementation.
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
