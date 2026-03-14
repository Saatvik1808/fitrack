"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, userProfile, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{
          width: 40, height: 40,
          border: '3px solid var(--border, rgba(255,255,255,0.1))',
          borderTop: '3px solid var(--accent, #6c63ff)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '2rem',
      background: 'var(--bg, #0a0a0f)',
    }}>
      <div style={{
        background: 'var(--bg2, #111118)',
        border: '1px solid var(--border, rgba(255,255,255,0.07))',
        borderRadius: 20,
        padding: '3rem 2.5rem',
        textAlign: 'center',
        maxWidth: 420,
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Fit<span style={{ color: 'var(--accent, #6c63ff)' }}>Track</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3, #5a5a72)', marginBottom: 32 }}>
          Personal AI Fitness Tracking OS
        </div>
        <button
          onClick={handleLogin}
          style={{
            background: 'var(--accent, #6c63ff)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '14px 32px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
        >
          Sign in with Google
        </button>
        <div style={{ fontSize: 11, color: 'var(--text3, #5a5a72)', marginTop: 16 }}>
          Secure authentication powered by Firebase
        </div>
      </div>
    </div>
  );
}
