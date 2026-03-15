import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus, Moon, Activity, Smile, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, SectionTitle, Divider, RangeInput, InputRow, Grid, Btn } from './UI.jsx';
import { formatDateFull } from '../utils/calculations.js';

const MOOD_OPTS = ['Terrible', 'Low', 'Okay', 'Good', 'Amazing'];
const ENERGY_LABELS = ['Dead', 'Tired', 'Okay', 'Good', 'Fired up'];
const DEFAULT_WATER_GOAL = 3000; // ml

export default function RecoveryTracker({ logs, setLog, today }) {
  const [date, setDate] = useState(today);
  
  const log = logs[date] || {};
  const isToday = date === today;

  function update(field, value) {
    setLog(date, { [field]: value });
  }

  function shiftDate(dir) {
    const [y, m, d] = date.split('-').map(Number);
    const nextDate = new Date(y, m - 1, d);
    nextDate.setDate(nextDate.getDate() + dir);
    
    const yy = nextDate.getFullYear();
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dd = String(nextDate.getDate()).padStart(2, '0');
    const next = `${yy}-${mm}-${dd}`;
    
    if (next <= today) setDate(next);
  }

  // Water Logic (stored in ml for precision, but displayed in L if needed)
  // Ensure we transition smoothly if old data was stored as liters (e.g. 3.5 -> 3500)
  const parseAmount = (val) => {
    if (!val) return 0;
    const n = Number(val);
    if (n < 20) return n * 1000; // Likely legacy liters (e.g., 3.5)
    return n; // Already in ml
  };

  const waterIntake = parseAmount(log.water);
  const waterGoal = parseAmount(log.waterGoal) || DEFAULT_WATER_GOAL;
  const progress = Math.min((waterIntake / waterGoal) * 100, 100) || 0;

  const addWater = (amount) => {
    update('water', waterIntake + amount);
  };

  const setGoal = (val) => {
    // Only accept reasonable ml goals, typically 1000 - 6000
    update('waterGoal', Math.max(1000, Number(val)));
  };

  return (
    <div className="fade-in">
      {/* Date nav */}
      <Card style={{ marginBottom: 16, padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => shiftDate(-1)} style={{ background: 'var(--bg3)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text)' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{isToday ? 'Today' : formatDateFull(date)}</div>
            {!isToday && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{date}</div>}
          </div>
          <button onClick={() => shiftDate(1)} disabled={isToday} style={{ background: 'var(--bg3)', border: 'none', borderRadius: 8, padding: 6, cursor: isToday ? 'not-allowed' : 'pointer', color: isToday ? 'var(--text3)' : 'var(--text)', opacity: isToday ? 0.4 : 1 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </Card>

      {/* Water Tracker */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(145deg, var(--bg2) 0%, rgba(56, 189, 248, 0.05) 100%)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: 10, borderRadius: 12 }}>
            <Droplets size={24} color="#38bdf8" />
          </div>
          <div>
            <SectionTitle style={{ marginBottom: 2, color: 'var(--text)' }}>Hydration</SectionTitle>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Track your daily water intake</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          {/* Circular Progress Ring */}
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="140" height="140" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="62" fill="none" stroke="var(--bg3)" strokeWidth="12" />
                <motion.circle 
                  cx="70" cy="70" r="62" fill="none" 
                  stroke="#38bdf8" strokeWidth="12" 
                  strokeDasharray="389.55" // 2 * pi * 62
                  strokeDashoffset={389.55 - (389.55 * progress) / 100} 
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
             </svg>
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{(waterIntake / 1000).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 500 }}>L</span></div>
               <div style={{ fontSize: 12, color: 'var(--text2)' }}>of {(waterGoal / 1000).toFixed(1)}L</div>
             </div>
          </div>
        </div>

        <Grid cols={3} gap={10} style={{ marginBottom: 16 }}>
          <Btn onClick={() => addWater(250)} variant="secondary" style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: 4, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>+250</span>
            <span style={{ fontSize: 10 }}>ml</span>
          </Btn>
          <Btn onClick={() => addWater(500)} variant="secondary" style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: 4, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>+500</span>
            <span style={{ fontSize: 10 }}>ml</span>
          </Btn>
          <Btn onClick={() => addWater(1000)} variant="secondary" style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: 4, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>+1L</span>
            <span style={{ fontSize: 10 }}>Bottle</span>
          </Btn>
        </Grid>

        {waterIntake > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => update('water', Math.max(0, waterIntake - 250))} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Minus size={12} /> Remove 250ml
            </button>
          </div>
        )}

        <Divider style={{ margin: '20px 0' }}/>
        
        <InputRow label="Daily Goal (ml)" hint={<span>{(waterGoal/1000).toFixed(1)}L</span>}>
          <input type="number" step="100" min="1000" max="6000" value={waterGoal} onChange={(e) => setGoal(e.target.value)} style={{ width: '100px' }} />
        </InputRow>
      </Card>

      {/* Recovery Metrics */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'var(--accent)22', padding: 10, borderRadius: 12 }}>
            <Moon size={24} color="var(--accent)" />
          </div>
          <div>
            <SectionTitle style={{ marginBottom: 2 }}>Sleep & Recovery</SectionTitle>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>How did your body recover?</div>
          </div>
        </div>

        <InputRow label="Sleep Duration" hint="hours">
          <input type="number" placeholder="7.5" step="0.5" min="0" max="24" value={log.sleep || ''} onChange={e => update('sleep', e.target.value)} />
        </InputRow>
        
        <Divider />
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Activity size={16} color="var(--yellow)" />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Energy Level</div>
          </div>
          <RangeInput
            label=""
            value={log.energy || 5}
            min={1} max={5}
            color="var(--yellow)"
            onChange={v => update('energy', v)}
          />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textAlign: 'right' }}>
            {ENERGY_LABELS[(log.energy || 5) - 1]}
          </div>
        </div>
        
        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Smile size={16} color="var(--accent)" />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Mood</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MOOD_OPTS.map(m => (
              <button
                key={m}
                onClick={() => update('mood', m)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  border: log.mood === m ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: log.mood === m ? 'var(--accent)22' : 'var(--bg3)',
                  color: log.mood === m ? 'var(--accent2)' : 'var(--text2)',
                  fontWeight: log.mood === m ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        
        <Divider />
        
        <InputRow label="Recovery notes">
          <textarea rows={3} placeholder="How are you feeling? Any soreness, stress, etc..." value={log.recoveryNotes || ''} onChange={e => update('recoveryNotes', e.target.value)} style={{ resize: 'vertical' }} />
        </InputRow>
      </Card>
      
    </div>
  );
}
