
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

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "false";

// Helper function to fetch or create a user profile in Firestore
const getOrCreateUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() } as User;
    } else {
        // This case is for social sign-ins where the user profile might not exist yet.
        // We create a partial doc but return null so the app routes to complete-profile.
        const [firstName, lastName] = firebaseUser.displayName?.split(' ') || ["", ""];
        
        const partialData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            firstName: firstName,
            lastName: lastName,
        };

        await setDoc(userDocRef, partialData, { merge: true });

        // Return a partial user object to signal that the profile is incomplete.
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            firstName: firstName,
            lastName: lastName,
        } as User;
    }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isDemoMode) {
        const setupDemo = async () => {
            const demoUser = await getUserById("KbawAuA2mDZvk0JmWxM0lcyS5R52");
            setCurrentUser(demoUser);
            setLoading(false);
        };
        setupDemo();
        return;
    }
    
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
    if (isDemoMode) {
      toast({ title: "Demo Mode", description: "Login is disabled in demo mode." });
      return false;
    }
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
     if (isDemoMode) {
      toast({ title: "Demo Mode", description: "Registration is disabled in demo mode." });
      return false;
    }
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
     if (isDemoMode) {
      toast({ title: "Demo Mode", description: "Social sign-in is disabled in demo mode." });
      return false;
    }
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
     if (isDemoMode) {
      toast({ title: "Demo Mode", description: "Social sign-in is disabled in demo mode." });
      return false;
    }
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
    if (isDemoMode) {
        setCurrentUser(null);
        router.push('/login');
        toast({ title: "Demo Mode", description: "You have been logged out of the demo." });
        return;
    }
    await signOut(auth);
    setCurrentUser(null);
    router.push('/login');
  };
  
  const updateCurrentUser = useCallback(async (userData: Partial<User>) => {
    if (isDemoMode) {
      if (currentUser) {
        setCurrentUser({ ...currentUser, ...userData });
        toast({ title: "Demo Mode", description: "User data updated in demo session." });
      }
      return;
    }
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
