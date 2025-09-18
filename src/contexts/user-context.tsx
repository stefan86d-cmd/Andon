
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Role, User } from '@/lib/types';
import { allUsers } from '@/lib/data';

interface UserContextType {
  currentUser: User | null;
  setUser: (role: Role | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const userProfiles = {
    admin: allUsers.find(u => u.role === 'admin'),
    operator: allUsers.find(u => u.role === 'operator'),
};


export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const setUser = (role: Role | null) => {
    if (role && userProfiles[role]) {
      setCurrentUser(userProfiles[role] as User);
    } else {
      setCurrentUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setUser }}>
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
