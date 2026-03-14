import React, { useState } from 'react'
import { Smartphone, Apple, QrCode, Wifi, Zap, Shield, Star, ChevronRight, Download, CheckCircle } from 'lucide-react'
import { Card, SectionTitle } from './UI.jsx'

const FEATURES = [
  { icon: Wifi, label: 'Works Offline', sub: 'No internet needed after install', color: 'var(--blue)' },
  { icon: Zap, label: 'Instant Launch', sub: 'Opens like a native app', color: 'var(--yellow)' },
  { icon: Shield, label: 'Private & Secure', sub: 'Data stored only on your device', color: 'var(--green)' },
  { icon: Star, label: 'AI Powered', sub: 'Google Gemini food analysis', color: 'var(--accent2)' },
]

const IOS_STEPS = [
  'Open FitTrack in Safari browser',
  'Tap the Share button (□↑) at the bottom',
  'Scroll down and tap "Add to Home Screen"',
  'Tap "Add" — done! 🎉',
]

const ANDROID_STEPS = [
  'Open FitTrack in Chrome browser',
  'Tap the three-dot menu (⋮) in the top right',
  'Tap "Add to Home Screen" or "Install App"',
  'Tap "Install" — done! 🎉',
]

function StoreButton({ platform, icon: Icon, bgColor, textColor = '#fff', label, sublabel }) {
  return (
    <a
      href="#"
      onClick={e => e.preventDefault()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: bgColor,
        borderRadius: 14,
        padding: '14px 20px',
        textDecoration: 'none',
        color: textColor,
        transition: 'all 0.2s ease',
        border: '1px solid var(--border)',
        flex: 1,
        minWidth: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Icon size={32} />
      <div>
        <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>{sublabel}</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{label}</div>
      </div>
    </a>
  )
}

function InstallSteps({ steps, platform, accentColor }) {
  return (
    <div>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: accentColor + '22',
            color: accentColor,
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1,
          }}>
            {i + 1}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, paddingTop: 3 }}>{step}</div>
        </div>
      ))}
    </div>
  )
}

export default function AppDownload() {
  const [activeTab, setActiveTab] = useState('ios')

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent)22 0%, var(--bg2) 60%)',
        borderRadius: 20,
        padding: '2rem 1.5rem',
        marginBottom: 16,
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px var(--accent)44',
        }}>
          <Download size={24} color="#fff" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>
          Fit<span style={{ color: 'var(--accent2)' }}>Track</span> Mobile
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 320, margin: '0 auto 20px', lineHeight: 1.6 }}>
          Install FitTrack as a native app on your phone — no App Store required. Works completely offline.
        </p>

        {/* Store buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <StoreButton
            platform="ios"
            icon={Apple}
            bgColor="var(--bg3)"
            label="App Store"
            sublabel="Download on the"
          />
          <StoreButton
            platform="android"
            icon={Smartphone}
            bgColor="var(--bg3)"
            label="Google Play"
            sublabel="Get it on"
          />
        </div>

        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10 }}>
          ⚡ Or install instantly as a PWA — faster than any app store
        </p>
      </div>

      {/* Feature highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {FEATURES.map(({ icon: Icon, label, sub, color }) => (
          <Card key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.9rem 1rem' }}>
            <div style={{
              width: 36, height: 36,
              background: color + '18',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color,
            }}>
              <Icon size={16} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Install instructions */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>How to Install</SectionTitle>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 10, padding: 3, marginBottom: 16, gap: 3 }}>
          {[
            { id: 'ios', label: '🍎 iOS / Safari' },
            { id: 'android', label: '🤖 Android / Chrome' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'var(--bg)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text)' : 'var(--text3)',
                boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'ios' ? (
          <InstallSteps steps={IOS_STEPS} platform="ios" accentColor="var(--blue)" />
        ) : (
          <InstallSteps steps={ANDROID_STEPS} platform="android" accentColor="var(--green)" />
        )}

        <div style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'var(--accent)10',
          borderRadius: 10,
          border: '1px solid var(--accent)22',
          fontSize: 12,
          color: 'var(--text2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <CheckCircle size={14} color="var(--green)" />
          After installing, FitTrack will appear on your home screen and launch in full-screen mode.
        </div>
      </Card>

      {/* QR Code card */}
      <Card style={{ textAlign: 'center', marginBottom: 14 }}>
        <SectionTitle>Scan to Open on Mobile</SectionTitle>
        <div style={{
          width: 120, height: 120,
          margin: '0 auto 12px',
          background: 'var(--bg)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed var(--border2)',
          flexDirection: 'column',
          gap: 6,
        }}>
          <QrCode size={48} color="var(--text3)" />
          <div style={{ fontSize: 9, color: 'var(--text3)' }}>QR code appears<br />when deployed</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
          Point your phone camera at the QR code to open FitTrack instantly
        </div>
      </Card>

      {/* Bottom note */}
      <Card style={{ background: 'var(--bg3)', textAlign: 'center', border: 'none' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.7 }}>
          FitTrack is a <strong style={{ color: 'var(--text2)' }}>Progressive Web App (PWA)</strong><br />
          No App Store approval needed · Always up-to-date · 100% free
        </div>
      </Card>
    </div>
  )
}
