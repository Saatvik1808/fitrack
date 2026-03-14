# Secure AI Fitness Tracking Web App

A production-ready Next.js fitness tracker with AI Food Analysis, Firebase Authentication, and secure per-user data isolation.

## 1. Full System Architecture

- **Frontend & Backend Framework:** Next.js (App Router). This allows us to unify the React frontend with secure Node.js serverless functions (API routes) in a single Vercel-friendly deployment.
- **Authentication:** Firebase Auth (Google Provider). Users log in client-side, and we maintain session context using a custom React Context (`AuthContext`).
- **Database:** Firebase Firestore. It provides a highly scalable NoSQL document store. It is free-tier generous and real-time capable.
- **AI Integration:** Google Gemini API 2.5 Flash. Used for image-to-nutrition parsing.
- **Styling:** Vanilla CSS Modules and Global CSS to fulfill the minimalistic, beautiful design requirement without heavier frameworks if not explicitly requested.
- **Data Visualization:** Chart.js & react-chartjs-2 for performance and visual progression tracking.

## 2. Security Requirements & Strategy

1. **API Key Protection:** The `GEMINI_API_KEY` is completely hidden from the client. When a user uploads a food image, the `AIFoodAnalyzer` component converts it to Base64 and POSTs it to the Next.js server route `/api/analyze-food`. 
2. **User API Keys:** Users can OPTIONALLY provide their own Gemini API key in the `Settings` page. This key is saved in their siloed Firestore document and passed securely in the POST payload body during the API request. It is NEVER logged or saved globally on the server.
3. **Database Silo / Isolation:** The Firestore security rules (`firestore.rules`) strictly enforce `request.auth.uid == userId`. A user cannot read or write any `dailyLogs`, `userPlans`, or `settings` that do not belong to their specific `uid`.
4. **Environment Variables:** All sensitive standard Firebase initialization keys are stored in environment variables.

## 3. Folder Structure

```
├── src/
│   ├── app/                 # Next.js App Router (Pages & API)
│   │   ├── api/             # Server API Routes (Secure Gemini endpoints)
│   │   ├── dashboard/       # Authenticated routes & Layouts
│   │   │   ├── log/         # Daily Logger UI
│   │   │   ├── history/     # Historical tracking
│   │   │   ├── progress/    # Chart tracking 
│   │   │   └── settings/    # API key and user management
│   │   ├── onboarding/      # First-use data collection & AI plan generation
│   │   ├── layout.js        # Root logic (Providers)
│   │   ├── page.js          # Main Login / Landing
│   │   └── globals.css      # Core minimalist styling logic
│   ├── components/          # Reusable UI elements (Nav, AIFoodAnalyzer, etc.)
│   ├── contexts/            # React Context (AuthContext)
│   └── lib/                 # Utility files (Firebase initialized config)
├── firestore.rules          # Security rules for Firestore
├── .env.local               # Environment variable storage
```

## 4. How to Run Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase and Gemini credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcde

   GEMINI_API_KEY=your_gemini_server_api_key
   ```
   *Note: Only the `NEXT_PUBLIC_` variables are sent to the browser. The `GEMINI_API_KEY` stays on the server.*

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 5. UI & Features
- Calculates BMR/TDEE on onboarding.
- Micro-animations and hover states via custom CSS variables (`--glass-card`).
- Real-time Chart.js integration showing Calorie deficits vs Maintenance logic based on goal weight timelines.
