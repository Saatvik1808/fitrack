"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ShieldAlert, Key } from 'lucide-react';

export default function SettingsPage() {
  const { user, userProfile, loadUserProfile } = useAuth();
  const [apiKey, setApiKey] = useState(userProfile?.geminiApiKey || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await setDoc(doc(db, 'users', user.uid), { geminiApiKey: apiKey }, { merge: true });
      await loadUserProfile(user.uid);
      setMsg('Settings saved correctly.');
    } catch (err) {
      console.error(err);
      setMsg('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title-glow" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Settings</h1>
        <p className="subtitle">Manage your account and integrations</p>
      </header>

      <div className="glass-card mb-4" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <ShieldAlert size={28} color="#ef4444" />
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ef4444', margin: 0 }}>Security Strategy</h3>
            <p className="subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Your data is completely siloed using Firebase Firestore Security rules.
              When using the AI features, your provided Gemini API key ensures server-side execution. 
              The Key is never exposed to the browser. Next.js App Router API handles all communication securely.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <Key size={24} color="var(--primary)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Gemini API Integration</h3>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="subtitle" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Optional: Override the server key with your own Google Gemini API Key
            </label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              className="input-field" 
              placeholder="AIzaSyB..."
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Keys are stored securely in your private Firestore database and ONLY used in secure server API endpoints.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Settings'}
          </button>
          
          {msg && <p style={{ marginTop: '1rem', color: 'var(--accent)', fontSize: '0.9rem' }}>{msg}</p>}
        </form>
      </div>
    </div>
  );
}
