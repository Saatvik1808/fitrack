"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css'; // We'll keep it simple or just use inline/globals

export default function LoginPage() {
  const { user, userProfile, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (userProfile) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, userProfile, loading, router]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-center full-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex-center full-screen login-container">
      <div className="glass-card text-center p-8">
        <h1 className="title-glow mb-4">FitTrack AI</h1>
        <p className="subtitle mb-8">Your personal AI fitness assistant</p>
        <button className="btn-primary" onClick={handleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
