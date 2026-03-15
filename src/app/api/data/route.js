import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

// Helper to verify the Token
async function verifyAuth(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized - Missing Token');
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (err) {
    console.error('Token verification failed', err);
    throw new Error('Unauthorized - Invalid Token');
  }
}

export async function GET(req) {
  try {
    const uid = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get('collection');

    if (!collectionName) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const docRef = adminDb.collection('users').doc(uid).collection('data').doc(collectionName);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(docSnap.data().data);
    } else {
      // Return 200 with null so client knows it's empty without throwing a fetch error
      return NextResponse.json(null, { status: 200 });
    }
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorized') ? 401 : 500 });
  }
}

export async function POST(req) {
  try {
    const uid = await verifyAuth(req);
    const body = await req.json();
    const { collectionName, data } = body;

    if (!collectionName || data === undefined) {
      return NextResponse.json({ error: 'Collection name and data are required' }, { status: 400 });
    }

    const docRef = adminDb.collection('users').doc(uid).collection('data').doc(collectionName);
    await docRef.set({ data }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorized') ? 401 : 500 });
  }
}
