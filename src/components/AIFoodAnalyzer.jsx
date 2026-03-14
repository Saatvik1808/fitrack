import React, { useState, useRef } from 'react'
import { Upload, Zap, Check, Edit3, AlertCircle, Camera } from 'lucide-react'
import { Card, Btn, InputRow, SectionTitle, Spinner, Badge } from './UI.jsx'
import { analyzeFoodImage, fileToBase64 } from '../utils/gemini.js'

const CONFIDENCE_COLOR = { high: 'var(--green)', medium: 'var(--yellow)', low: 'var(--red)' }

export default function AIFoodAnalyzer({ onAddToLog, apiKey }) {
  const [image, setImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [edited, setEdited] = useState({})
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    setResult(null)
    setError(null)
    setSaved(false)
    const url = URL.createObjectURL(file)
    setImage(url)
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  async function analyze() {
    if (!imageFile) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { base64, mimeType } = await fileToBase64(imageFile)
      const data = await analyzeFoodImage(base64, mimeType, apiKey)
      setResult(data)
      setEdited({
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        foodName: data.foodName,
        portionSize: data.portionSize,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSaveToLog() {
    onAddToLog({
      calories: edited.calories,
      protein: edited.protein,
      carbs: edited.carbs,
      fat: edited.fat,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>AI Food Analyzer</h2>
        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Upload a food photo and Gemini AI will estimate the nutrition breakdown</p>
      </div>

      {!apiKey && (
        <Card style={{ border: '1px solid var(--yellow)44', background: 'var(--yellow)0a', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--yellow)', marginBottom: 3 }}>Gemini API key required</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                Go to <strong>Settings → Gemini API Key</strong> and enter your key.<br />
                Get a free key at <span style={{ color: 'var(--accent2)' }}>aistudio.google.com/app/apikey</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: image ? '1px solid var(--border)' : '1.5px dashed var(--border2)',
          borderRadius: 'var(--radius)',
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          background: image ? 'transparent' : 'var(--bg2)',
          marginBottom: 14,
          transition: 'border-color 0.2s',
        }}
      >
        {image ? (
          <>
            <img
              src={image}
              alt="Food"
              style={{ width: '100%', maxHeight: 280, objectFit: 'contain' }}
            />
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'var(--bg)cc',
              borderRadius: 6, padding: '4px 8px',
              fontSize: 11, color: 'var(--text2)',
              backdropFilter: 'blur(4px)',
            }}>
              Tap to change photo
            </div>
          </>
        ) : (
          <>
            <div style={{ background: 'var(--accent)18', borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <Camera size={28} color="var(--accent)" />
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Upload food photo</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Tap to select or drag & drop</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>JPG, PNG, WEBP supported</div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {image && !loading && !result && (
        <Btn
          onClick={analyze}
          disabled={!apiKey || loading}
          variant="primary"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}
        >
          <Zap size={14} /> Analyze with Gemini AI
        </Btn>
      )}

      {loading && (
        <Card style={{ marginBottom: 14, textAlign: 'center', padding: '2rem' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text2)' }}>Gemini is analyzing your food...</div>
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text3)' }}>This usually takes 2–5 seconds</div>
        </Card>
      )}

      {error && (
        <Card style={{ border: '1px solid var(--red)44', background: 'var(--red)0a', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertCircle size={16} color="var(--red)" />
            <div style={{ fontSize: 13, color: 'var(--red)' }}>{error}</div>
          </div>
        </Card>
      )}

      {result && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{edited.foodName || result.foodName}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{edited.portionSize || result.portionSize}</div>
            </div>
            <Badge color={CONFIDENCE_COLOR[result.confidence]}>
              {result.confidence} confidence
            </Badge>
          </div>

          {result.ingredients?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {result.ingredients.map(ing => (
                <Badge key={ing} color="var(--bg4)">{ing}</Badge>
              ))}
            </div>
          )}

          <div style={{
            background: 'var(--bg3)',
            borderRadius: 10,
            padding: '1rem',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit3 size={12} /> EDIT NUTRITION VALUES BEFORE SAVING
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { key: 'calories', label: 'Calories', unit: 'kcal', color: 'var(--green)' },
                { key: 'protein', label: 'Protein', unit: 'g', color: 'var(--blue)' },
                { key: 'carbs', label: 'Carbs', unit: 'g', color: 'var(--orange)' },
                { key: 'fat', label: 'Fat', unit: 'g', color: 'var(--pink)' },
              ].map(({ key, label, unit, color }) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                    {label} ({unit})
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={edited[key]}
                      onChange={e => setEdited(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ fontWeight: 700, fontSize: 16, color, paddingRight: 32 }}
                    />
                    <span style={{ position: 'absolute', right: 10, fontSize: 11, color: 'var(--text3)', pointerEvents: 'none' }}>{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {result.fiber && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
                Fiber: {result.fiber}g
              </div>
            )}
          </div>

          {result.notes && (
            <div style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontStyle: 'italic' }}>
              💡 {result.notes}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Btn
              onClick={() => { setResult(null); setImage(null); setImageFile(null) }}
              variant="ghost"
              style={{ justifyContent: 'center' }}
            >
              Analyze another
            </Btn>
            <Btn
              onClick={handleSaveToLog}
              variant={saved ? 'success' : 'primary'}
              style={{ justifyContent: 'center' }}
            >
              {saved ? <><Check size={14} /> Added!</> : 'Add to today\'s log'}
            </Btn>
          </div>
        </Card>
      )}

      {/* How it works */}
      {!result && !loading && (
        <Card style={{ marginTop: 16, background: 'var(--bg3)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 10 }}>How it works</div>
          {[
            ['📸', 'Upload a clear photo of your food'],
            ['🤖', 'Gemini 1.5 Flash analyzes the image'],
            ['🍗', 'Get estimated calories, protein, carbs & fat'],
            ['✏️', 'Edit the values if needed'],
            ['✅', 'Save directly to today\'s nutrition log'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13, color: 'var(--text2)' }}>
              <span style={{ fontSize: 16, width: 24 }}>{icon}</span>
              {text}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
