"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { useState } from "react"
import { X, Plus, AlertTriangle, TrendingUp, Trash2 } from "lucide-react"

export type QualitySession = {
  id: string
  date: string
  category: string
  score: number
  whyNotTen?: string
  createdAt: string
}

type QualityData = { sessions: QualitySession[] }
const DEFAULT: QualityData = { sessions: [] }

const CATEGORIES = ['Gym', 'Study', 'Code', 'Work', 'Diet', 'Sleep', 'Focus', 'Other']

const C = {
  bg: '#2C1810', fg: '#F0DEC8', red: '#C07840',
  muted: '#9A806A', border: '#5A3820', cardBg: '#3A2216', softBorder: '#6A4830',
  danger: '#dc2626',
}

export function getSevenDayAverage(sessions: QualitySession[]): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const recent = sessions.filter(s => new Date(s.date) >= cutoff)
  if (recent.length === 0) return -1
  return recent.reduce((sum, s) => sum + s.score, 0) / recent.length
}

const scoreColor = (s: number) => {
  if (s === 10) return '#22c55e'
  if (s >= 9) return '#84cc16'
  if (s >= 7) return '#f59e0b'
  if (s >= 5) return '#f97316'
  return C.danger
}

export function QualityTracker() {
  const [data, setData] = useSyncedState<QualityData>("quality_scores_v1", DEFAULT)
  const [showLog, setShowLog] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [category, setCategory] = useState('Gym')
  const [score, setScore] = useState<number | null>(null)
  const [pendingScore, setPendingScore] = useState<number | null>(null)
  const [whyNotTen, setWhyNotTen] = useState("")
  const [todayDate] = useState(() => new Date().toISOString().split('T')[0])

  const sessions = data?.sessions ?? []
  const avg = getSevenDayAverage(sessions)
  const isWarning = avg >= 0 && avg < 9.5

  const pickScore = (s: number) => {
    if (s < 10) {
      setPendingScore(s)
      setWhyNotTen("")
      setShowWhy(true)
    } else {
      setScore(s)
    }
  }

  // Confirm "Why Not 10" → saves the session immediately, closes both modals
  const confirmWhy = () => {
    if (!whyNotTen.trim() || pendingScore === null) return
    const session: QualitySession = {
      id: `qs_${Date.now()}`, date: todayDate, category, score: pendingScore,
      whyNotTen: whyNotTen.trim(),
      createdAt: new Date().toISOString(),
    }
    setData(prev => ({ sessions: [session, ...(prev?.sessions ?? [])] }))
    setShowWhy(false); setShowLog(false)
    setScore(null); setPendingScore(null); setWhyNotTen(""); setCategory('Gym')
  }

  // Save for score = 10 only (no why needed)
  const save = () => {
    if (score === null) return
    const session: QualitySession = {
      id: `qs_${Date.now()}`, date: todayDate, category, score,
      createdAt: new Date().toISOString(),
    }
    setData(prev => ({ sessions: [session, ...(prev?.sessions ?? [])] }))
    setShowLog(false); setScore(null); setWhyNotTen(""); setCategory('Gym')
  }

  const deleteSession = (id: string) => {
    setData(prev => ({ sessions: (prev?.sessions ?? []).filter(s => s.id !== id) }))
  }

  const recent = sessions.slice(0, 14)

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
        <div style={{ background: C.cardBg, border: `1.5px solid ${isWarning ? C.danger : C.border}`, padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.375rem' }}>
            7-Day Excellence Avg
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: avg < 0 ? C.muted : scoreColor(avg), fontFamily: 'monospace', lineHeight: 1 }}>
              {avg < 0 ? '—' : avg.toFixed(1)}
            </span>
            {avg >= 0 && <span style={{ fontSize: '0.65rem', color: C.muted }}>/10</span>}
          </div>
          {isWarning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.375rem' }}>
              <AlertTriangle style={{ width: '10px', height: '10px', color: C.danger }} />
              <span style={{ fontSize: '0.58rem', color: C.danger, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Below 9.5 — Raise Standards</span>
            </div>
          )}
          {avg >= 9.5 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.375rem' }}>
              <TrendingUp style={{ width: '10px', height: '10px', color: '#22c55e' }} />
              <span style={{ fontSize: '0.58rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Elite Standard</span>
            </div>
          )}
        </div>
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.border}`, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.375rem' }}>Sessions Logged</p>
          <span style={{ fontSize: '2.25rem', fontWeight: 800, color: C.fg, fontFamily: 'monospace', lineHeight: 1 }}>{sessions.length}</span>
          <button onClick={() => setShowLog(true)} style={{ marginTop: '0.75rem', background: C.red, border: `1.5px solid ${C.red}`, color: C.bg, padding: '0.4rem 0.625rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content' }}>
            <Plus style={{ width: '9px', height: '9px' }} /> Log Session
          </button>
        </div>
      </div>

      {/* Mini Score Grid (last 14) */}
      {recent.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.5rem' }}>Recent Sessions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {recent.map(s => (
              <div key={s.id} style={{ background: C.cardBg, border: `1.5px solid ${C.border}`, padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <span style={{ fontSize: '1.375rem', fontWeight: 800, color: scoreColor(s.score), fontFamily: 'monospace', lineHeight: 1, minWidth: '2rem', textAlign: 'right' }}>
                  {s.score}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.fg }}>{s.category}</span>
                    <span style={{ fontSize: '0.58rem', color: C.muted }}>{s.date}</span>
                  </div>
                  {s.whyNotTen && (
                    <p style={{ fontSize: '0.62rem', color: C.muted, marginTop: '0.1rem', fontStyle: 'italic', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{s.whyNotTen}"
                    </p>
                  )}
                </div>
                <button onClick={() => deleteSession(s.id)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.1rem', opacity: 0.4, flexShrink: 0 }}>
                  <Trash2 style={{ width: '11px', height: '11px' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {showLog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowLog(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{ position: 'relative', background: C.bg, border: `1.5px solid ${C.border}`, width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Log Session Quality</span>
              <button onClick={() => setShowLog(false)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}><X style={{ width: '15px', height: '15px' }} /></button>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.4rem' }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.3rem' }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      style={{ background: category === cat ? C.red : C.cardBg, border: `1.5px solid ${category === cat ? C.red : C.border}`, color: category === cat ? C.bg : C.muted, padding: '0.3rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.4rem' }}>
                  Score (1–10) — Only 10 is acceptable without explanation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.2rem' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => (
                    <button key={s} onClick={() => pickScore(s)}
                      style={{ background: score === s ? scoreColor(s) : C.cardBg, border: `1.5px solid ${score === s ? scoreColor(s) : C.border}`, color: score === s ? (s >= 5 ? '#000' : '#fff') : C.muted, padding: '0.45rem 0', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'center' as const }}>
                      {s}
                    </button>
                  ))}
                </div>
                {score === 10 && <p style={{ fontSize: '0.58rem', color: '#22c55e', marginTop: '0.375rem', fontWeight: 700, letterSpacing: '0.06em' }}>PERFECT. Maximum output.</p>}
              </div>
              <button onClick={save} disabled={score === null}
                style={{ background: score !== null ? C.red : C.cardBg, border: `1.5px solid ${score !== null ? C.red : C.border}`, color: score !== null ? C.bg : C.muted, padding: '0.7rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: score !== null ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Why Not 10 Modal */}
      {showWhy && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.88)' }} />
          <div style={{ position: 'relative', background: C.bg, border: `2px solid ${C.danger}`, width: '100%', maxWidth: '400px', margin: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: C.danger }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: C.danger, letterSpacing: '0.05em' }}>
                {pendingScore}/10 — WHY NOT 10?
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: C.fg, lineHeight: 1.5, fontWeight: 600 }}>
              You chose {pendingScore}. What specific compromise prevented maximum output?
            </p>
            <textarea value={whyNotTen} onChange={e => setWhyNotTen(e.target.value)}
              placeholder="Be brutally honest. What exactly held you back? No excuses." rows={4} autoFocus
              style={{ width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'inherit', resize: 'none' as const, outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' as const }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setShowWhy(false); setPendingScore(null); setWhyNotTen("") }}
                style={{ flex: 1, background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted, padding: '0.6rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={confirmWhy} disabled={!whyNotTen.trim()}
                style={{ flex: 2, background: whyNotTen.trim() ? C.danger : C.cardBg, border: `1.5px solid ${whyNotTen.trim() ? C.danger : C.border}`, color: whyNotTen.trim() ? '#fff' : C.muted, padding: '0.6rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: whyNotTen.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                Confirm — Save {pendingScore}/10
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
