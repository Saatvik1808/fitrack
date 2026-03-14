"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import AIFoodAnalyzer from '@/components/AIFoodAnalyzer';

export default function DailyLogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState({
    calories: '', protein: '', carbs: '', fat: '', weight: '', sleep: ''
  });
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadToday() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'dailyLogs', user.uid, 'logs', today));
        if (snap.exists()) {
          setLogs(snap.data());
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadToday();
  }, [user, today]);

  const handleChange = (e) => {
    setLogs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAISuccess = async (foodData) => {
    // Add the AI data to current inputs
    setLogs(prev => {
      const updated = {
        ...prev,
        calories: Number(prev.calories || 0) + (foodData.calories || 0),
        protein: Number(prev.protein || 0) + (foodData.protein || 0),
        carbs: Number(prev.carbs || 0) + (foodData.carbs || 0),
        fat: Number(prev.fat || 0) + (foodData.fat || 0)
      };
      saveToFirestore(updated);
      return updated;
    });
    alert(`Analyzed ${foodData.foodName} (${foodData.portionSize}): Added ${foodData.calories} calories.`);
  };

  const saveToFirestore = async (dataToSave) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'dailyLogs', user.uid, 'logs', today), {
        ...dataToSave,
        date: today,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error(err);
      alert('Error saving log');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    saveToFirestore(logs);
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title-glow" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Daily Log</h1>
        <p className="subtitle">Track your nutrition and metrics for {today}</p>
      </header>

      <AIFoodAnalyzer onAnalysisComplete={handleAISuccess} />

      <div className="glass-card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          Manual Entry
        </h3>

        <form onSubmit={handleManualSave} style={{ display: 'grid', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="subtitle" style={{ fontSize: '0.85rem' }}>Calories (kcal)</label>
              <input type="number" name="calories" value={logs.calories} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="subtitle" style={{ fontSize: '0.85rem' }}>Protein (g)</label>
              <input type="number" name="protein" value={logs.protein} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="subtitle" style={{ fontSize: '0.85rem' }}>Carbs (g)</label>
              <input type="number" name="carbs" value={logs.carbs} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="subtitle" style={{ fontSize: '0.85rem' }}>Fat (g)</label>
              <input type="number" name="fat" value={logs.fat} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="subtitle" style={{ fontSize: '0.85rem' }}>Morning Weight (kg)</label>
              <input type="number" step="0.1" name="weight" value={logs.weight} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="subtitle" style={{ fontSize: '0.85rem' }}>Sleep (hours)</label>
              <input type="number" step="0.5" name="sleep" value={logs.sleep} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Manual Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
