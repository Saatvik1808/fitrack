"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Activity, Flame, Dumbbell, Route } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const [plan, setPlan] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const planSnap = await getDoc(doc(db, 'userPlans', user.uid));
        if (planSnap.exists()) {
          setPlan(planSnap.data());
        }

        const logsRef = collection(db, 'dailyLogs', user.uid, 'logs');
        const q = query(logsRef, orderBy('date', 'desc'), limit(7));
        const qSnap = await getDocs(q);
        
        const logs = [];
        qSnap.forEach(doc => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        setRecentLogs(logs.reverse()); // chronological for chart
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Fallback info
  const todayLog = recentLogs.length > 0 && recentLogs[recentLogs.length - 1].date === new Date().toISOString().split('T')[0] 
      ? recentLogs[recentLogs.length - 1] 
      : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const targetCals = plan?.dailyCalories || 2000;
  const currentCals = todayLog.calories || 0;

  const chartData = {
    labels: recentLogs.map(l => l.date),
    datasets: [
      {
        label: 'Calories Consumed',
        data: recentLogs.map(l => l.calories || 0),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8' } },
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title-glow" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Welcome back, {user?.displayName?.split(' ')[0] || 'Athlete'}
        </h1>
        <p className="subtitle">Here is your daily overview</p>
      </header>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)' }}>
            <span style={{ fontWeight: 600 }}>Calories</span>
            <Flame size={20} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {currentCals} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {targetCals}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ 
              background: 'var(--accent)', 
              height: '100%', 
              width: `${Math.min((currentCals / targetCals) * 100, 100)}%` 
            }} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c084fc' }}>
            <span style={{ fontWeight: 600 }}>Protein</span>
            <Dumbbell size={20} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {todayLog.protein || 0}g <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {plan?.protein || 150}g</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}>
            <span style={{ fontWeight: 600 }}>Goal Progress</span>
            <Activity size={20} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {userProfile?.weight}kg <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>→ {userProfile?.goalWeight}kg</span>
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Weekly Calorie Trend</h3>
        <div style={{ height: 300 }}>
           {recentLogs.length > 0 ? (
             <Line data={chartData} options={chartOptions} />
           ) : (
             <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
               No log data for this week yet. Start logging!
             </div>
           )}
        </div>
      </div>

    </div>
  );
}
