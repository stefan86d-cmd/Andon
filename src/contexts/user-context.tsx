
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { getUserByEmail } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for development
const mockUsersByEmail: { [email: string]: User } = {
  'alex.j@andon.io': {
    id: '0P6TMG7LyyWKatYHFNVXpVoRQSC2',
    name: 'Alex Johnson',
    email: 'alex.j@andon.io',
    avatarUrl: '',
    role: 'admin',
    plan: 'pro',
  },
  'sam.m@andon.io': {
    id: 'mock-sam',
    name: 'Sam Miller',
    email: 'sam.m@andon.io',
    avatarUrl: '',
    role: 'supervisor',
    plan: 'pro',
  },
    'maria.g@andon.io': {
    id: 'mock-maria',
    name: 'Maria Garcia',
    email: 'maria.g@andon.io',
    avatarUrl: '',
    role: 'operator',
    plan: 'pro',
  }
};


export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if a user session exists in localStorage
    const storedUserEmail = localStorage.getItem('currentUserEmail');
    if (storedUserEmail) {
      const user = mockUsersByEmail[storedUserEmail];
      if (user) {
        setCurrentUser(user);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const user = mockUsersByEmail[email];
    if (user) {
      localStorage.setItem('currentUserEmail', email);
      setCurrentUser(user);
      setLoading(false);
    } else {
        setLoading(false);
        throw new Error("Invalid credentials for mock user.");
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUserEmail');
    setCurrentUser(null);
    router.push('/');
  };
  
  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    // Also update the mock data so it persists across reloads for this session
    if (user && user.email) {
        mockUsersByEmail[user.email] = user;
    }
  }


  return (
    <UserContext.Provider value={{ currentUser, loading, login, logout, updateCurrentUser }}>
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
