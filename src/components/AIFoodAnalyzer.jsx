"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Upload, CheckCircle2 } from 'lucide-react';

export default function AIFoodAnalyzer({ onAnalysisComplete }) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;

        // 2. Send to our SECURE Next.js API route
        // This ensures the Gemini API key is never leaked to the client
        const res = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type,
            userApiKey: userProfile?.geminiApiKey // User optionally provided their own key
          })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to analyze food');
        }

        onAnalysisComplete(data);
        setLoading(false);
      };
      
      reader.onerror = () => {
        throw new Error("Failed to read image file");
      };

    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="glass-card mb-8" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981' }}>
          <Camera size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#10b981' }}>AI Food Image Analysis</h3>
          <p className="subtitle" style={{ margin: 0, fontSize: '0.9rem' }}>Upload a picture of your meal for automatic macro tracking</p>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageUpload}
          style={{ 
            opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' 
          }}
          disabled={loading}
        />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', border: '2px dashed rgba(16, 185, 129, 0.4)', borderRadius: '12px',
          background: 'rgba(0,0,0,0.2)', transition: 'background 0.2s',
          pointerEvents: 'none'
        }}>
          {loading ? (
             <div className="spinner" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }}></div>
          ) : (
            <>
              <Upload size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Tap to upload or take a photo</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Powered by Google Gemini 2.5 Flash</p>
            </>
          )}
        </div>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.9rem' }}>Error: {error}</p>}
    </div>
  );
}
