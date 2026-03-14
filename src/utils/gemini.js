/**
 * Google Gemini API - Food Image Analysis
 * Model: gemini-2.5-flash (vision-capable, fast & free tier available)
 * 
 * SETUP:
 * 1. Go to https://aistudio.google.com/app/apikey
 * 2. Create a free API key
 * 3. Enter it in Settings > Gemini API Key inside the app
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const FOOD_ANALYSIS_PROMPT = `You are a professional nutritionist and food recognition AI.

Analyze this food image and provide a detailed nutritional estimate.

RESPOND ONLY WITH VALID JSON in this exact format (no markdown, no explanation):
{
  "foodName": "name of the food/meal",
  "portionSize": "estimated portion (e.g., 1 bowl ~300g)",
  "calories": 450,
  "protein": 35,
  "carbs": 45,
  "fat": 12,
  "fiber": 4,
  "confidence": "high|medium|low",
  "notes": "brief nutritional note",
  "ingredients": ["ingredient1", "ingredient2"]
}

Use realistic estimates based on typical Indian/Asian serving sizes.
If you cannot clearly identify the food, set confidence to "low" and make your best estimate.`

export async function analyzeFoodImage(imageBase64, mimeType, apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API key not set. Go to Settings to add your key.')
  }

  const body = {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: mimeType,
            data: imageBase64,
          }
        },
        {
          text: FOOD_ANALYSIS_PROMPT
        }
      ]
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    }
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `API error ${res.status}`
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('Empty response from Gemini')

  // Strip markdown code fences if present
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('Could not parse Gemini response. Try again.')
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        const MAX_DIM = 800
        
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          } else {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        const base64 = dataUrl.split(',')[1]
        resolve({ base64, mimeType: 'image/jpeg' })
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
