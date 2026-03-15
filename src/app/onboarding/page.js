"use client";

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useStorage'
import { formatLocalYYYYMMDD } from '@/utils/calculations'
import { Activity, Target } from 'lucide-react'
import { Card, SectionTitle, InputRow, Btn } from '@/components/UI'

export default function Onboarding() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile, loadingProfile] = useProfile(user?.uid, user?.email)
  
  const [form, setForm] = useState({
    name: '',
    currentWeight: '',
    goalWeight: '',
    height: '',
    activityLevel: 'moderate'
  })
  const [isSaving, setIsSaving] = useState(false)

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // If profile is already populated (e.g. Saatvik), go straight to Dashboard
  // Ignore this check if actively saving, let handleSave do the routing securely.
  useEffect(() => {
    if (!loadingProfile && profile && profile.currentWeight && !isSaving) {
      router.push('/dashboard')
    }
  }, [profile, loadingProfile, isSaving, router])

  const calculateTargets = () => {
    const weight = Number(form.currentWeight)
    const height = Number(form.height)
    let bmr = 10 * weight + 6.25 * height - 5 * 25 + 5 // Simplified Mifflin-St Jeor

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    }
    const tdee = bmr * activityMultipliers[form.activityLevel]
    
    // Caloric deficit/surplus depending on goal
    const goalDiff = Number(form.goalWeight) - weight
    const isLosing = goalDiff < 0

    const dailyCalories = Math.round(tdee + (isLosing ? -500 : (goalDiff > 0 ? 300 : 0)))
    const dailyProtein = Math.round(weight * 2.0) // 2g per kg

    return { calories: dailyCalories, protein: dailyProtein }
  }

  const handleSave = async () => {
    if (!form.name || !form.currentWeight || !form.goalWeight || !form.height) {
      alert("Please fill all required fields")
      return
    }

    setIsSaving(true);
    const { calories, protein } = calculateTargets()

    await setProfile({
      name: form.name,
      currentWeight: Number(form.currentWeight),
      startWeight: Number(form.currentWeight),
      goalWeight: Number(form.goalWeight),
      height: Number(form.height),
      startDate: formatLocalYYYYMMDD(),
      dailyCalorieTarget: calories,
      dailyProteinTarget: protein,
      geminiApiKey: ''
    }, { immediate: true })

    router.push('/dashboard')
  }

  if (loading || loadingProfile || isSaving || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '1rem', background: 'var(--bg)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <Card style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ background: 'var(--accent)18', display: 'inline-flex', padding: 14, borderRadius: 16, marginBottom: 12 }}>
              <Target size={32} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Welcome to FitTrack</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Let's set up your personal training profile.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputRow label="Your Name">
              <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </InputRow>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InputRow label="Current Weight" hint="kg">
                <input type="number" placeholder="e.g. 75" value={form.currentWeight} onChange={e => setForm(p => ({ ...p, currentWeight: e.target.value }))} />
              </InputRow>

              <InputRow label="Goal Weight" hint="kg">
                <input type="number" placeholder="e.g. 68" value={form.goalWeight} onChange={e => setForm(p => ({ ...p, goalWeight: e.target.value }))} />
              </InputRow>
            </div>

            <InputRow label="Height" hint="cm">
              <input type="number" placeholder="e.g. 175" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} />
            </InputRow>

            <InputRow label="Activity Level">
              <select value={form.activityLevel} onChange={e => setForm(p => ({...p, activityLevel: e.target.value}))}>
                <option value="sedentary">Sedentary (Office job, little exercise)</option>
                <option value="light">Light (Exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                <option value="active">Active (Exercise 6-7 days/week)</option>
              </select>
            </InputRow>
          </div>

          <Btn onClick={handleSave} variant="primary" style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: '14px' }}>
            Calculate My Targets & Start
          </Btn>
        </Card>
      </motion.div>
    </div>
  )
}
