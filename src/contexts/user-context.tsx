
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth, useFirestore } from '@/firebase';
import type { Plan, User } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const firestore = useFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, now get the profile from firestore
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setCurrentUser(userData);

          // Ensure custom claims are set
          const idTokenResult = await firebaseUser.getIdTokenResult();
          if (idTokenResult.claims.role !== userData.role) {
            await setCustomUserClaims(firebaseUser.uid, { role: userData.role });
            // Force a refresh of the token to get new claims
            await firebaseUser.getIdToken(true);
          }

        } else {
          // This can happen if a user signs in with a social provider for the first time
          console.warn(`User profile not found in Firestore for UID: "${firebaseUser.uid}". Attempting to create it.`);
          
          try {
            const [firstName, ...lastNameParts] = (firebaseUser.displayName || 'New User').split(' ');
            const lastName = lastNameParts.join(' ');
            
            const result = await addUser({
                uid: firebaseUser.uid,
                firstName,
                lastName,
                email: firebaseUser.email!,
                role: 'admin', // First user via social is an admin
                plan: 'starter',
                avatarUrl: firebaseUser.photoURL || '',
            });

            if (result.success) {
                const newUserDoc = await getDoc(userDocRef);
                if (newUserDoc.exists()) {
                    setCurrentUser({ id: newUserDoc.id, ...newUserDoc.data() } as User);
                    await firebaseUser.getIdToken(true); // Force refresh for new claims
                }
            } else {
                throw new Error("Failed to create user document via server action.");
            }

          } catch (error) {
              console.error("Failed to create user document on-the-fly:", error);
              await signOut(auth); // Sign out if profile creation fails
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
  }, [auth, firestore]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const signInWithProvider = async (provider: GoogleAuthProvider | OAuthProvider, plan: Plan = 'starter') => {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const [firstName, ...lastNameParts] = (user.displayName || 'New User').split(' ');
        const lastName = lastNameParts.join(' ');
        await addUser({
            uid: user.uid,
            firstName,
            lastName,
            email: user.email!,
            role: 'admin',
            plan: plan,
            avatarUrl: user.photoURL || '',
        });
    }
     // Force refresh token to get custom claims on first login
    await user.getIdToken(true);
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
        // If role was changed, we need to force a token refresh
        if (userData.role && userData.role !== currentUser.role) {
            auth.currentUser?.getIdToken(true);
        }
    }
  }, [currentUser, auth.currentUser]);


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
