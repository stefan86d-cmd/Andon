
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { getUserByEmail } from '@/lib/data';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user for development when Firebase is disabled
const MOCK_ADMIN_USER: User = {
  id: '0P6TMG7LyyWKatYHFNVXpVoRQSC2',
  name: 'Alex Johnson',
  email: 'alex.j@andon.io',
  avatarUrl: 'https://picsum.photos/seed/0P6TMG7LyyWKatYHFNVXpVoRQSC2/100/100',
  role: 'admin',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a user session exists in localStorage
    const storedUserEmail = localStorage.getItem('currentUserEmail');
    if (storedUserEmail) {
      // In a real app, you'd fetch the user profile. Here we'll just use the mock user if email matches.
      if (storedUserEmail === MOCK_ADMIN_USER.email) {
        setCurrentUser(MOCK_ADMIN_USER);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    // For now, we only support logging in as the mock admin user
    if (email === MOCK_ADMIN_USER.email) {
      localStorage.setItem('currentUserEmail', email);
      setCurrentUser(MOCK_ADMIN_USER);
    } else {
        // In a real scenario, you might fetch other user profiles
        // For this mock, we'll just throw an error for unknown users.
        throw new Error("Invalid mock user email. Only 'alex.j@andon.io' is supported in mock mode.");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('currentUserEmail');
    setCurrentUser(null);
  };


  return (
    <UserContext.Provider value={{ currentUser, loading, login, logout }}>
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
