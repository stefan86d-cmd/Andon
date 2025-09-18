
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Role, User } from '@/lib/types';
import { allUsers } from '@/lib/data';

interface UserContextType {
  currentUser: User | null;
  setUser: (role: Role | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const userProfiles = allUsers.reduce((acc, user) => {
    // Use a unique key for each user, like email or a designated property
    if (user.role === 'admin' && user.email === 'alex.j@andon.io') {
      acc['admin'] = user;
    } else if (user.role === 'operator' && user.email === 'sam.m@andon.io') {
      acc['operator'] = user;
    }
    return acc;
}, {} as Record<Role, User>);


export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const setUser = (role: Role | null) => {
    if (role && userProfiles[role]) {
      setCurrentUser(userProfiles[role]);
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
