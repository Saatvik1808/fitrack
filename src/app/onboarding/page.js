"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingPage() {
  const { user, loadUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    goalWeight: '',
    bodyType: 'mesomorph',
    activityLevel: 'moderately_active',
    fitnessGoal: 'fat_loss',
    gymDays: '3',
    dietPreference: 'omnivore',
    timelineGoal: '12', // weeks
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateMacros = (data) => {
    // Basic metabolic math based on Mifflin-St Jeor
    const weightKg = parseFloat(data.weight);
    const heightCm = parseFloat(data.height);
    const age = parseInt(data.age);
    // Rough estimate (assuming average between men/women since gender isn't asked for simplicity)
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5; 
    
    let activityMultiplier = 1.2; // Sedentary
    if (data.activityLevel === 'moderately_active') activityMultiplier = 1.55;
    if (data.activityLevel === 'very_active') activityMultiplier = 1.725;

    let tdee = bmr * activityMultiplier;

    let targetCalories = tdee;
    if (data.fitnessGoal === 'fat_loss') targetCalories -= 500;
    if (data.fitnessGoal === 'muscle_gain') targetCalories += 300;

    const targetProtein = weightKg * 2.2; // 2.2g per kg (or ~1g per lb)
    const targetFat = (targetCalories * 0.25) / 9; // 25% of cals from fat
    const targetCarbs = (targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4;

    return {
      dailyCalories: Math.round(targetCalories),
      protein: Math.round(targetProtein),
      carbs: Math.round(targetCarbs),
      fats: Math.round(targetFat)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      const profileData = { ...formData, userId: user.uid };
      const planData = calculateMacros(formData);

      // Save Profile
      await setDoc(doc(db, 'users', user.uid), profileData);
      
      // Save Generated Plan
      await setDoc(doc(db, 'userPlans', user.uid), {
        ...planData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      // Update local state and redirect
      await loadUserProfile(user.uid);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
      setLoading(false);
    }
  };

  return (
    <div className="flex-center full-screen" style={{ padding: '2rem' }}>
      <div className="glass-card" style={{ maxWidth: 600, width: '100%' }}>
        <h2 className="title-glow text-center mb-4" style={{ fontSize: '2rem' }}>Configure Your AI Plan</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="subtitle" style={{ fontSize: '0.9rem' }}>Age</label>
              <input required type="number" name="age" value={formData.age} onChange={handleChange} className="input-field" placeholder="e.g. 25" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="subtitle" style={{ fontSize: '0.9rem' }}>Height (cm)</label>
              <input required type="number" name="height" value={formData.height} onChange={handleChange} className="input-field" placeholder="e.g. 175" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="subtitle" style={{ fontSize: '0.9rem' }}>Current Weight (kg)</label>
              <input required type="number" name="weight" value={formData.weight} onChange={handleChange} className="input-field" placeholder="e.g. 75" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="subtitle" style={{ fontSize: '0.9rem' }}>Goal Weight (kg)</label>
              <input required type="number" name="goalWeight" value={formData.goalWeight} onChange={handleChange} className="input-field" placeholder="e.g. 70" />
            </div>
          </div>

          <div>
            <label className="subtitle" style={{ fontSize: '0.9rem' }}>Fitness Goal</label>
            <select name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} className="input-field">
              <option value="fat_loss">Fat Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="general_fitness">General Fitness / Recomp</option>
              <option value="running">Running Performance</option>
            </select>
          </div>

          <div>
            <label className="subtitle" style={{ fontSize: '0.9rem' }}>Activity Level</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="input-field">
              <option value="sedentary">Sedentary (Office Job)</option>
              <option value="moderately_active">Moderately Active (3-4 days/week)</option>
              <option value="very_active">Very Active (5+ days/week)</option>
            </select>
          </div>

          <div>
            <label className="subtitle" style={{ fontSize: '0.9rem' }}>Dietary Preference</label>
            <select name="dietPreference" value={formData.dietPreference} onChange={handleChange} className="input-field">
              <option value="omnivore">Omnivore / No Restrictions</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>

          <button type="submit" className="btn-primary mt-4" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Generating Plan...' : 'Generate My AI Fitness Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}
