"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // The root user profile is managed directly via the API now or we can just fetch the detailed PROFILE block.
  // For basic info, we don't strictly need a separate root document if everything is in /data/PROFILE.
  const loadUserProfile = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      // Ensure the user root document/basic profile exists via an API call
      // For now, setting userProfile to the currentUser object is usually enough for the UI (name, photo)
      const basicInfo = { 
        email: currentUser.email, 
        displayName: currentUser.displayName, 
        photoURL: currentUser.photoURL, 
      };
      setUserProfile(basicInfo);
      return basicInfo;
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
    setUserProfile(null);
    return null;
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loginWithGoogle, logout, loadUserProfile, loading, getToken }}>
        {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
