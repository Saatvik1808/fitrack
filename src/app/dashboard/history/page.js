"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function HistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const q = query(collection(db, 'dailyLogs', user.uid, 'logs'), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        const data = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title-glow" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Log History</h1>
        <p className="subtitle">Your historical fitness data</p>
      </header>
      
      <div className="glass-card" style={{ display: 'grid', gap: '1rem' }}>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No logs found. Start tracking!</p>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{log.date}</strong>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {log.calories || 0} kcal, {log.protein || 0}g protein
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Weight: {log.weight || '-'} kg</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sleep: {log.sleep || '-'} hrs</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
