
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { Role, User } from '@/lib/types';
import { allUsers } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserContextType {
  currentUser: User | null;
  setUser: (role: Role | null) => void; // This will be simplified
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const userProfiles: Record<Role, User | undefined> = {
    admin: allUsers.find(u => u.role === 'admin'),
    supervisor: allUsers.find(u => u.role === 'supervisor'),
    operator: allUsers.find(u => u.role === 'operator'),
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock function to simulate setting user. In a real app this would
  // involve a full auth flow.
  const setUser = (role: Role | null) => {
    if (role && userProfiles[role]) {
      setCurrentUser(userProfiles[role] as User);
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // In a real Firebase app, you would use onAuthStateChanged to listen for
    // auth state changes and then fetch the user profile from Firestore.
    // For now, we'll keep the mock implementation but set loading to false.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in. Find their profile in our mock data.
        // In a real app, you would fetch this from Firestore.
        const userProfile = allUsers.find(u => u.email === user.email);
        if (userProfile) {
          setCurrentUser(userProfile);
        } else {
          // If profile doesn't exist (e.g. new user), you might want to create it
          // or handle it differently. For now, we'll sign them out.
          setCurrentUser(null);
        }
      } else {
        // User is signed out.
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // For the purpose of this prototype, we'll just stop loading.
    setLoading(false);

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setUser, loading }}>
      {!loading && children}
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
