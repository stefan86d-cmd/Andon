
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { 
    getAuth,
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
    OAuthProvider,
    Auth
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { getClientInstances } from '@/firebase/client';
import type { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { getClientUserById } from '@/lib/data';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithMicrosoft: () => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (user: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  const handleAuthUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userProfile = await getClientUserById(firebaseUser.uid);
      if (userProfile) {
        setCurrentUser(userProfile);
      } else {
        // This is a new user who just signed up, but their profile isn't in Firestore yet.
        // We create a temporary user object. The full profile will be created in /complete-profile
        setCurrentUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          firstName: firebaseUser.displayName?.split(' ')[0] || "",
          lastName: firebaseUser.displayName?.split(' ')[1] || "",
          role: "" as any, // This indicates an incomplete profile
          plan: "starter", // Default plan
          address: "",
          country: "",
          phone: "",
          orgId: firebaseUser.uid, // The new user's ID becomes their organization ID
        });
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const { app, db } = getClientInstances();
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, handleAuthUser);
    return () => unsubscribe();
  }, [handleAuthUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!auth) return false;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user
      return true;
    } catch (error: any) {
      let message = "An unknown error occurred.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          message = "Invalid email or password. Please try again.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
      setLoading(false);
      return false;
    }
  };
  
  const registerWithEmail = async (email: string, password: string): Promise<boolean> => {
    if (!auth) return false;
    const { db } = getClientInstances();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Immediately create a basic user profile in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        firstName: "", // Will be filled in during profile completion
        lastName: "",  // Will be filled in during profile completion
        role: "" as any, // Indicates incomplete profile
        plan: "starter", // Default plan
        address: "",
        country: "",
        orgId: firebaseUser.uid, // The new user's ID becomes their organization ID
        notificationPreferences: { newIssue: true, issueResolved: false, muteSound: true }, // Default notification prefs
        theme: 'system', // Default theme
      };
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, newUser);

      // Manually trigger user update to avoid race conditions with the auth listener
      await handleAuthUser(firebaseUser);
      
      return true;
    } catch (error: any) {
      let message = "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
          message = "This email address is already in use.";
      }
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: message,
      });
      setLoading(false);
      return false;
    }
  };
  
  const socialSignIn = async (provider: GoogleAuthProvider | OAuthProvider): Promise<boolean> => {
      if (!auth) return false;
      setLoading(true);
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
          setLoading(false);
          return false;
      }
  }

  const signInWithGoogle = async (): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    return socialSignIn(provider);
  }

  const signInWithMicrosoft = async (): Promise<boolean> => {
    const provider = new OAuthProvider('microsoft.com');
    return socialSignIn(provider);
  };

  const logout = async () => {
     if (!auth) return;
     setLoading(true);
     await signOut(auth);
     setCurrentUser(null);
     setLoading(false);
  };
  
  const updateCurrentUser = useCallback(async (userData: Partial<User>) => {
    const { db } = getClientInstances();
    if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        
        try {
            if (!db) throw new Error("Firestore is not initialized");
            const userDocRef = doc(db, "users", currentUser.id);

            // Convert Date objects to Firestore Timestamps for serialization
            const dataToSave: any = { ...userData };
            if (dataToSave.subscriptionStartsAt instanceof Date) {
                dataToSave.subscriptionStartsAt = Timestamp.fromDate(dataToSave.subscriptionStartsAt);
            }
            if (dataToSave.subscriptionEndsAt instanceof Date) {
                dataToSave.subscriptionEndsAt = Timestamp.fromDate(dataToSave.subscriptionEndsAt);
            }

            await setDoc(userDocRef, dataToSave, { merge: true });
            // After successful DB write, update local state
            setCurrentUser(updatedUser);
        } catch (error) {
             toast({
              variant: "destructive",
              title: "Update Failed",
              description: "Could not save your changes. Please try again.",
            });
            // Re-throw to inform calling components of the failure
            throw error;
        }
    } else {
        const error = new Error("Cannot update user, no user is currently logged in.");
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message,
        });
        throw error;
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
