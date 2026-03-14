"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ProgressPage() {
  const { user, userProfile } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const q = query(collection(db, 'dailyLogs', user.uid, 'logs'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        const data = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        setLogs(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [user]);

  const weightData = {
    labels: logs.map(l => l.date),
    datasets: [{
      label: 'Morning Weight (kg)',
      data: logs.map(l => Number(l.weight) || null),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.3
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title-glow" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Goal Progress</h1>
        <p className="subtitle">Track your weight over time</p>
      </header>
      
      <div className="glass-card mb-8">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Weight Tracking Dashboard</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Target Goal: {userProfile?.goalWeight} kg</p>
        <div style={{ height: 350 }}>
           {logs.length > 0 ? (
             <Line data={weightData} options={chartOptions} />
           ) : (
             <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
               Log your weight consistently to see trends!
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
