
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth, useFirestore } from '@/firebase';
import type { Plan, User } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { addUser } from '@/app/actions';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (plan?: Plan) => Promise<void>;
  signInWithMicrosoft: (plan?: Plan) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
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
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // This can happen if a user signs in with a social provider for the first time
          // and the registration process was interrupted. We will attempt to create the user doc here.
          console.warn(`User profile not found in Firestore for UID: "${firebaseUser.uid}". This can happen if the registration process was interrupted. Attempting to create it now.`);
          
          try {
            const [firstName, ...lastNameParts] = (firebaseUser.displayName || 'New User').split(' ');
            const lastName = lastNameParts.join(' ');
            
            const newUser: Omit<User, 'id'> = {
                name: `${firstName} ${lastName}`,
                email: firebaseUser.email!,
                role: 'admin',
                plan: 'starter',
                avatarUrl: firebaseUser.photoURL || '',
            };

            await setDoc(doc(firestore, "users", firebaseUser.uid), newUser);
            
            const newUserDoc = await getDoc(userDocRef);
            if (newUserDoc.exists()) {
                setCurrentUser({ id: newUserDoc.id, ...newUserDoc.data() } as User);
            } else {
                throw new Error("Failed to create and retrieve user document.");
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
  
  const signInWithGoogle = async (plan: Plan = 'starter') => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const [firstName, ...lastNameParts] = (user.displayName || 'New User').split(' ');
      const lastName = lastNameParts.join(' ');
      
      // Check for the specific test email to assign the 'pro' plan
      const finalPlan = user.email === 'stefan86d@gmail.com' ? 'pro' : plan;

      const newUser: Omit<User, 'id'> = {
          name: `${firstName} ${lastName}`,
          email: user.email!,
          role: 'admin',
          plan: finalPlan,
          avatarUrl: user.photoURL || '',
      };
      await setDoc(userDocRef, newUser);
    }
  }

  const signInWithMicrosoft = async (plan: Plan = 'starter') => {
    const provider = new OAuthProvider('microsoft.com');
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const [firstName, ...lastNameParts] = (user.displayName || 'New User').split(' ');
      const lastName = lastNameParts.join(' ');
      
      const newUser: Omit<User, 'id'> = {
          name: `${firstName} ${lastName}`,
          email: user.email!,
          role: 'admin',
          plan: plan,
          avatarUrl: user.photoURL || '',
      };
      await setDoc(userDocRef, newUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    router.push('/login');
  };
  
  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
  }

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
