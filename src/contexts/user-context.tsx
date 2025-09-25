
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { useAuth, useFirestore } from '@/firebase';
import type { User } from '@/lib/types';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
          // Handle case where user exists in Firebase Auth but not in our user data
          console.error("User profile not found in Firestore for UID:", firebaseUser.uid);
          setCurrentUser(null);
          await signOut(auth); // Sign out the user
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
    setLoading(true);
    try {
      // Check user count against plan limit before allowing login
      const userToLogin = await getDoc(doc(firestore, "users", `email:${email}`)); // This is a simplification. A query is needed.
      if (userToLogin.exists()) {
          const userPlan = userToLogin.data().plan;
          const role = userToLogin.data().role;
          const planLimits = {
            starter: { users: 5 },
            standard: { users: 50 },
            pro: { users: 150 },
            enterprise: { users: Infinity },
          };
          
          const usersSnapshot = await getDocs(collection(firestore, "users"));
          const totalUsers = usersSnapshot.size;
          
          if (totalUsers > planLimits[userPlan].users && role !== 'admin') {
              throw new Error("Account user limit exceeded. Please contact your administrator.");
          }
      }

      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will be handled by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
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

    