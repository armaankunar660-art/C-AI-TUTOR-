import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

export interface StudentSignUpMeta {
  college?: string;
  branch?: string;
  semester?: string;
  examDate?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isGuest: boolean;
  error: string | null;
  clearError: () => void;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    meta?: StudentSignUpMeta
  ) => Promise<User>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<User>;
  logOut: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('c_tutor_guest_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuest(false);
        try {
          localStorage.removeItem('c_tutor_guest_mode');
        } catch {}
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    meta?: StudentSignUpMeta
  ): Promise<User> => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName.trim()) {
        await updateFirebaseProfile(cred.user, { displayName: displayName.trim() });
      }
      // Temporarily store signup metadata in session for StudentContext initial sync
      if (meta) {
        try {
          sessionStorage.setItem(
            `c_tutor_signup_meta_${cred.user.uid}`,
            JSON.stringify(meta)
          );
        } catch {}
      }
      return cred.user;
    } catch (err: any) {
      const msg = mapAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      return cred.user;
    } catch (err: any) {
      const msg = mapAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const msg = mapAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async (): Promise<User> => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      const msg = mapAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logOut = async (): Promise<void> => {
    setError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsGuest(false);
      try {
        localStorage.removeItem('c_tutor_guest_mode');
      } catch {}
    } catch (err: any) {
      const msg = mapAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    try {
      localStorage.setItem('c_tutor_guest_mode', 'true');
    } catch {}
  };

  const exitGuest = () => {
    setIsGuest(false);
    try {
      localStorage.removeItem('c_tutor_guest_mode');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isGuest,
        error,
        clearError,
        signUpWithEmail,
        signInWithEmail,
        sendPasswordReset,
        signInWithGoogle,
        logOut,
        continueAsGuest,
        exitGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function mapAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please log in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not yet enabled in the Firebase Console. You can explore as a guest or sign in with Google.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to multiple failed login attempts. Try again later or reset password.';
    default:
      return err?.message || 'Authentication error. Please check your network and credentials.';
  }
}
