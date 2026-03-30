"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { useState, useEffect } from "react"
import { X, AlertTriangle, Lock, Lightbulb, Plus, ChevronRight } from "lucide-react"

export type PainEntry = {
  id: string
  what: string
  how: string
  createdAt: string
  lockedUntil: string
  rootCause?: string
  principle?: string
  reflectedAt?: string
}

type PainData = { entries: PainEntry[] }

const DEFAULT: PainData = { entries: [] }

const C = {
  bg: '#2C1810', fg: '#F0DEC8', red: '#C07840',
  muted: '#9A806A', border: '#5A3820', cardBg: '#3A2216',
  softBorder: '#6A4830', danger: '#dc2626',
}

export function PainButton() {
  const [data, setData] = useSyncedState<PainData>("pain_entries_v1", DEFAULT)
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'list' | 'new' | 'reflect'>('list')
  const [selected, setSelected] = useState<PainEntry | null>(null)
  const [now, setNow] = useState(Date.now())

  const [what, setWhat] = useState("")
  const [how, setHow] = useState("")
  const [rootCause, setRootCause] = useState("")
  const [principle, setPrinciple] = useState("")

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const entries = data?.entries ?? []
  const pending = entries.filter(e => !e.reflectedAt && new Date(e.lockedUntil).getTime() <= now)

  const submit = () => {
    if (!what.trim() || !how.trim()) return
    const entry: PainEntry = {
      id: `pain_${Date.now()}`,
      what: what.trim(),
      how: how.trim(),
      createdAt: new Date().toISOString(),
      lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
    setData(prev => ({ entries: [entry, ...(prev?.entries ?? [])] }))
    setWhat(""); setHow(""); setView('list')
  }

  const reflect = () => {
    if (!selected || !rootCause.trim() || !principle.trim()) return
    setData(prev => ({
      entries: (prev?.entries ?? []).map(e =>
        e.id === selected.id
          ? { ...e, rootCause: rootCause.trim(), principle: principle.trim(), reflectedAt: new Date().toISOString() }
          : e
      )
    }))
    setRootCause(""); setPrinciple(""); setSelected(null); setView('list')
  }

  const openReflect = (entry: PainEntry) => {
    setSelected(entry)
    setRootCause(entry.rootCause || "")
    setPrinciple(entry.principle || "")
    setView('reflect')
  }

  const timeLeft = (lockedUntil: string) => {
    const ms = new Date(lockedUntil).getTime() - now
    if (ms <= 0) return null
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setView('list') }}
        className={pending.length > 0 ? "animate-pulse" : ""}
        style={{
          position: 'fixed', bottom: '5rem', left: '1.25rem', zIndex: 40,
          background: pending.length > 0 ? C.danger : C.cardBg,
          border: `1.5px solid ${pending.length > 0 ? C.danger : C.border}`,
          color: pending.length > 0 ? '#fff' : C.muted,
          padding: '0.45rem 0.875rem', fontSize: '0.6rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase' as const,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}
        title="Pain Button — Dalio Method"
      >
        <AlertTriangle style={{ width: '11px', height: '11px' }} />
        {pending.length > 0 ? `REFLECT (${pending.length})` : 'PAIN'}
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setIsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{
            position: 'relative', background: C.bg, border: `1.5px solid ${C.border}`,
            width: '100%', maxWidth: '520px', maxHeight: '82vh', margin: '1rem',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle style={{ width: '13px', height: '13px', color: C.danger }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
                  {view === 'new' ? 'New Pain Entry' : view === 'reflect' ? 'Reflection & Principle' : `Pain Log (${entries.length})`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {view === 'list' && (
                  <button onClick={() => setView('new')} style={{ background: C.danger, border: 'none', color: '#fff', padding: '0.3rem 0.625rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Plus style={{ width: '9px', height: '9px' }} /> New
                  </button>
                )}
                {view !== 'list' && (
                  <button onClick={() => { setView('list'); setSelected(null) }} style={{ background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted, padding: '0.3rem 0.625rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ← Back
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}>
                  <X style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

              {/* ── NEW ENTRY ── */}
              {view === 'new' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.65rem', color: C.muted, lineHeight: 1.6 }}>
                    Record the event objectively. Entry locks for 24 hours — emotional analysis is forbidden until then.
                  </p>
                  <div>
                    <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.4rem' }}>
                      What happened? (facts only, no interpretation)
                    </label>
                    <textarea value={what} onChange={e => setWhat(e.target.value)} placeholder="Describe exactly what occurred..." rows={4}
                      style={{ width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.7rem', fontSize: '0.75rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' as const }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.4rem' }}>
                      How did it make you feel?
                    </label>
                    <textarea value={how} onChange={e => setHow(e.target.value)} placeholder="Raw emotional response..." rows={3}
                      style={{ width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.7rem', fontSize: '0.75rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' as const }} />
                  </div>
                  <div style={{ padding: '0.7rem', background: C.cardBg, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Lock style={{ width: '11px', height: '11px', color: C.danger, flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '0.6rem', color: C.muted, lineHeight: 1.5 }}>
                      This entry locks for 24 hours. Root cause analysis and principles are only added after the lock expires — no emotional edits.
                    </p>
                  </div>
                  <button onClick={submit} disabled={!what.trim() || !how.trim()}
                    style={{ background: what.trim() && how.trim() ? C.danger : C.cardBg, border: `1.5px solid ${what.trim() && how.trim() ? C.danger : C.border}`, color: what.trim() && how.trim() ? '#fff' : C.muted, padding: '0.7rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: what.trim() && how.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                    Lock Entry — 24 Hours
                  </button>
                </div>
              )}

              {/* ── REFLECT ── */}
              {view === 'reflect' && selected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.875rem', background: C.cardBg, border: `1.5px solid ${C.border}` }}>
                    <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.4rem' }}>Original Event</p>
                    <p style={{ fontSize: '0.75rem', color: C.fg, lineHeight: 1.6, marginBottom: '0.375rem' }}>{selected.what}</p>
                    <p style={{ fontSize: '0.7rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.4 }}>"{selected.how}"</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.4rem' }}>
                      Root Cause — Why did this really happen?
                    </label>
                    <textarea value={rootCause} onChange={e => setRootCause(e.target.value)} placeholder="Go deeper than the surface. What was the fundamental cause?" rows={4}
                      style={{ width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.7rem', fontSize: '0.75rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' as const }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.4rem' }}>
                      Principle — How to never let this happen again
                    </label>
                    <textarea value={principle} onChange={e => setPrinciple(e.target.value)} placeholder="Write a concrete, actionable principle that prevents recurrence..." rows={3}
                      style={{ width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.7rem', fontSize: '0.75rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' as const }} />
                  </div>
                  <button onClick={reflect} disabled={!rootCause.trim() || !principle.trim()}
                    style={{ background: rootCause.trim() && principle.trim() ? C.red : C.cardBg, border: `1.5px solid ${rootCause.trim() && principle.trim() ? C.red : C.border}`, color: rootCause.trim() && principle.trim() ? C.bg : C.muted, padding: '0.7rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: rootCause.trim() && principle.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                    Save Reflection & Principle
                  </button>
                </div>
              )}

              {/* ── LIST ── */}
              {view === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {entries.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2.5rem 0', color: C.muted }}>
                      <AlertTriangle style={{ width: '28px', height: '28px', margin: '0 auto 0.625rem', opacity: 0.35 }} />
                      <p style={{ fontSize: '0.7rem' }}>No pain entries yet.</p>
                      <p style={{ fontSize: '0.6rem', marginTop: '0.25rem', opacity: 0.6 }}>Press "New" when you encounter failure or discomfort.</p>
                    </div>
                  )}
                  {entries.map(entry => {
                    const tl = timeLeft(entry.lockedUntil)
                    const isLocked = !!tl
                    const isDone = !!entry.reflectedAt
                    return (
                      <div key={entry.id} style={{ background: C.cardBg, border: `1.5px solid ${!isDone && !isLocked ? C.danger : isDone ? C.softBorder : C.border}`, padding: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.375rem' }}>
                          <p style={{ fontSize: '0.75rem', color: C.fg, lineHeight: 1.5, flex: 1 }}>{entry.what}</p>
                          {isLocked
                            ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                <Lock style={{ width: '9px', height: '9px', color: C.muted }} />
                                <span style={{ fontSize: '0.6rem', color: C.muted, fontFamily: 'monospace' }}>{tl}</span>
                              </div>
                            : !isDone
                              ? <button onClick={() => openReflect(entry)} style={{ background: C.danger, border: 'none', color: '#fff', padding: '0.25rem 0.5rem', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  Reflect <ChevronRight style={{ width: '9px', height: '9px' }} />
                                </button>
                              : <span style={{ fontSize: '0.58rem', color: C.red, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, flexShrink: 0 }}>✓ Reflected</span>
                          }
                        </div>
                        <p style={{ fontSize: '0.65rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.4, marginBottom: entry.principle ? '0.5rem' : 0 }}>
                          "{entry.how}"
                        </p>
                        {entry.principle && (
                          <div style={{ padding: '0.5rem 0.625rem', background: C.bg, border: `1px solid ${C.softBorder}`, display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                            <Lightbulb style={{ width: '10px', height: '10px', color: C.red, flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.65rem', color: C.fg, lineHeight: 1.5 }}>{entry.principle}</p>
                          </div>
                        )}
                        <p style={{ fontSize: '0.55rem', color: C.muted, marginTop: '0.375rem', opacity: 0.6 }}>
                          {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
