
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { Plan, User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Firebase has been removed. This context now provides a mock, logged-out state.

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithMicrosoft: () => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (user: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth status
    setTimeout(() => {
        setCurrentUser(null);
        setLoading(false);
    }, 500);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    toast({ variant: "destructive", title: "Login Disabled", description: "Firebase has been removed." });
    return false;
  };
  
  const registerWithEmail = async (email: string, password: string): Promise<boolean> => {
     toast({ variant: "destructive", title: "Registration Disabled", description: "Firebase has been removed." });
    return false;
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    toast({ variant: "destructive", title: "Login Disabled", description: "Firebase has been removed." });
    return false;
  }

  const signInWithMicrosoft = async (): Promise<boolean> => {
    toast({ variant: "destructive", title: "Login Disabled", description: "Firebase has been removed." });
    return false;
  };

  const logout = async () => {
     toast({ title: "Logged Out (Mock)"});
     setCurrentUser(null);
  };
  
  const updateCurrentUser = useCallback(async (userData: Partial<User>) => {
    // Do nothing, as there is no user to update.
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loading, login, registerWithEmail, signInWithGoogle, signInWithMicrosoft, logout, updateCurrentUser }}>
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
