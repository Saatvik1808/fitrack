"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Nav from '@/components/Nav';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-center full-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Nav />
      <main style={{
        flex: 1,
        padding: '2rem',
        marginLeft: '250px', // width of the sidebar
        maxWidth: '1200px',
        width: '100%',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
            padding-bottom: 90px !important;
            padding-top: 1.5rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
