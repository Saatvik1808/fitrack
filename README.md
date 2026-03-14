# FitTrack OS 🏋️

A complete AI-powered personal fitness tracker built for your 84 kg → 70 kg transformation.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Gemini API Setup (AI Food Analysis)

1. Get free key at: https://aistudio.google.com/app/apikey
2. In app → Settings → Gemini API Key → paste & save
3. Go to AI Food tab → upload food photo → analyze!

## Features
- Daily body + nutrition + recovery logging
- AI food photo analysis (Gemini 1.5 Flash)
- Workout logger (sets/reps/weight + volume calc)
- Running tracker (pace, calories, chart)
- Dashboard with Chart.js charts
- History with CSV + JSON export
- Works offline (localStorage)

## Your targets (pre-configured)
- Calories: 1,650 kcal/day
- Protein: 163g/day  
- Start: 84 kg → Goal: 70 kg

## Build for production
```bash
npm run build
npm run preview
```

## Project structure
src/components/ — Nav, Dashboard, DailyLog, WorkoutLogger, RunningTracker, AIFoodAnalyzer, History, Settings, UI
src/hooks/useStorage.js — all localStorage hooks
src/utils/calculations.js — BMI, pace, volume, progress
src/utils/gemini.js — Gemini API integration
# fitrack
