import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase/config';
import { Role, UserProfile } from '../types';
import { trackEvent } from '../services/analytics';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: Role;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bootstrapped admin email designated by system environment
const BOOTSTRAPPED_SUPER_ADMIN_EMAIL = 'samiranhajong617@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // 1. Check for Admin status
          const isBootstrappedAdmin =
            user.email?.toLowerCase() === BOOTSTRAPPED_SUPER_ADMIN_EMAIL.toLowerCase();

          let userRole: Role = isBootstrappedAdmin ? 'SUPER_ADMIN' : 'CUSTOMER';

          // Check /admins/{uid} doc
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (adminDoc.exists()) {
              const data = adminDoc.data();
              userRole = (data.role as Role) || 'ADMIN';
            } else if (isBootstrappedAdmin) {
              // Ensure bootstrapped admin document exists for consistency
              await setDoc(
                adminDocRef,
                {
                  userId: user.uid,
                  email: user.email,
                  role: 'SUPER_ADMIN',
                  name: user.displayName || 'Owner Admin',
                  createdAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }
          } catch (e) {
            console.debug('Admin check note:', e);
          }

          setRole(userRole);

          // 2. Fetch or create Customer Profile
          const profileRef = doc(db, 'users', user.uid);
          const profileDoc = await getDoc(profileRef);
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              userId: user.uid,
              email: user.email || '',
              name: user.displayName || 'Customer',
              role: userRole,
              addresses: [],
              createdAt: new Date().toISOString(),
            };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error synchronizing user profile:', error);
        }
      } else {
        setUserProfile(null);
        setRole('CUSTOMER');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await trackEvent('login', { method: 'google', email: res.user.email });
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await trackEvent('login', { method: 'password', email: res.user.email });
    } catch (err: any) {
      console.error('Email sign-in failed:', err);
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        await trackEvent('sign_up', { method: 'password', email });
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUserProfile(null);
    setRole('CUSTOMER');
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const profileRef = doc(db, 'users', currentUser.uid);
      await setDoc(profileRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR'].includes(role);
  const isSuperAdmin = role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        isAdmin,
        isSuperAdmin,
        loading,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        updateCustomerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
