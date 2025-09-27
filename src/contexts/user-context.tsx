
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Plan, User } from '@/lib/types';
import { getUserByEmail, getUserById } from '@/lib/data';
import { addUser } from '@/app/actions';
import { auth, db } from '@/firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
    getAuth,
    signInWithRedirect,
    getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';


interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithMicrosoft: () => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (user: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper function to fetch or create a user profile in Firestore
const getOrCreateUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() } as User;
    } else {
        // This case is for social sign-ins where the user profile might not exist yet.
        // The profile is typically created fully on the complete-profile page.
        // We'll return a partial user object for now.
        const [firstName, lastName] = firebaseUser.displayName?.split(' ') || ["", ""];
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            firstName,
            lastName,
            role: 'admin', // Default new sign-ups to admin
            plan: 'starter', // Default to starter plan
            address: "",
            country: "",
        };
    }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userProfile = await getOrCreateUserProfile(firebaseUser);
            setCurrentUser(userProfile);
        } else {
            setCurrentUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will handle setting the user
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      return false;
    }
  };
  
  const registerWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // Auth state will change and trigger profile creation flow
        return true;
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message
        });
        return false;
    }
  };

  const signInWithProvider = async (provider: GoogleAuthProvider): Promise<boolean> => {
    try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle the rest
        return true;
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Sign-in Failed",
            description: error.message,
        });
        return false;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    return signInWithProvider(provider);
  }

  const signInWithMicrosoft = async (): Promise<boolean> => {
    // Firebase does not have a direct Microsoft provider for web like Google/Facebook.
    // This typically requires a custom flow with OAuth.
    // For this app, we will mock a failure and guide the user.
    toast({
        title: "Not Implemented",
        description: "Microsoft sign-in is not configured for this application. Please use Google or Email.",
        variant: "destructive",
    });
    return false;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    router.push('/login');
  };
  
  const updateCurrentUser = useCallback(async (userData: Partial<User>) => {
    if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        const userDocRef = doc(db, "users", currentUser.id);
        await setDoc(userDocRef, updatedUser, { merge: true });
        setCurrentUser(updatedUser);
    }
  }, [currentUser]);


  return (
    <UserContext.Provider value={{ currentUser, loading, login, registerWithEmail, signInWithGoogle, signInWithMicrosoft, logout, updateCurrentUser }}>
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
