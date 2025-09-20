
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { Role, User } from '@/lib/types';
import { getUserByEmail } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        // User is signed in. Fetch their profile from Firestore.
        try {
            const userProfile = await getUserByEmail(user.email);
            if (userProfile) {
              setCurrentUser(userProfile);
            } else {
              // If profile doesn't exist in Firestore, sign them out.
              // This can happen if a user is deleted from the db but still has a valid auth session.
              setCurrentUser(null);
              await signOut(auth);
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setCurrentUser(null);
        }
      } else {
        // User is signed out.
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loading }}>
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
