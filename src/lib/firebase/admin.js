import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const apps = getApps();

// We need a service account. Try to parse from env variable.
// Otherwise attempt default initialization (works on Google Cloud/Vercel with proper setup)
let adminApp;
if (!apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      adminApp = initializeApp(); 
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
} else {
  adminApp = apps[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
