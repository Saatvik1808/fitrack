import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
// Removed unused firebase-admin imports

// In a real production scenario with Firebase Admin SDK, we'd verify the token.
// Since we don't have the user's service account JSON for Admin SDK right now,
// we will handle security by just accepting an optional provided API key or our server key.
// But the key is NEVER exposed to the frontend.

export async function POST(req) {
  try {
    const { imageBase64, mimeType, userApiKey } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Security Requirement: API keys must never be exposed to the client.
    // Use env variable or user's provided key.
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'No Gemini API key available. Please add it in settings or environment variables.' }, { status: 401 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Remove data:image/...;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Analyze this food image. Provide ONLY a valid JSON object with the following keys and accurate numeric estimates (no markdown formatting, no text outside JSON):
    {
      "foodName": "String description of food",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "portionSize": "String guess of portion"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType || 'image/jpeg'
          }
        }
      ]
    });

    const textResult = response.text;
    
    // Extract JSON block if surrounded by markdown code blocks
    let jsonStr = textResult.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }

    const parsed = JSON.parse(jsonStr.trim());
    
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
