"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from '@/firebase';
import type { Plan, User } from '@/lib/types';
import { getUserByEmail } from '@/lib/data';
import { addUser, setCustomUserClaims } from '@/app/actions';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  const auth = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get the mock profile from our mock data
        const userProfile = await getUserByEmail(firebaseUser.email!);

        if (userProfile) {
          setCurrentUser(userProfile);
        } else {
           console.warn(`MOCK: User profile not found for email: "${firebaseUser.email}". Using a default mock profile.`);
           const defaultMockUser = await getUserByEmail("stefan.deronjic@andonpro.com");
           if (defaultMockUser) {
              setCurrentUser(defaultMockUser);
           } else {
             setCurrentUser(null);
           }
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const signInWithProvider = async (provider: GoogleAuthProvider | OAuthProvider, plan: Plan = 'starter') => {
    const userCredential = await signInWithPopup(auth, provider);
    // In this mock version, we don't need to do anything extra.
    // The onAuthStateChanged listener will pick up the logged-in user.
  }

  const signInWithGoogle = async (plan: Plan = 'starter') => {
    const provider = new GoogleAuthProvider();
    await signInWithProvider(provider, plan);
  }

  const signInWithMicrosoft = async (plan: Plan = 'starter') => {
    const provider = new OAuthProvider('microsoft.com');
    await signInWithProvider(provider, plan);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
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