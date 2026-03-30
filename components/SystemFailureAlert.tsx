"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { useEffect, useState } from "react"
import { AlertTriangle, Settings, X } from "lucide-react"

type FailureSettings = {
  enabled: boolean
  deadlineHour: number
  deadlineMinute: number
  message: string
  dismissedDate: string
}

type CompletedRecord = Record<string, boolean>
type Task = { id: string }

const DEFAULT_SETTINGS: FailureSettings = {
  enabled: true,
  deadlineHour: 23,
  deadlineMinute: 0,
  message: "System Failure: Discipline Missing",
  dismissedDate: "",
}

const C = {
  bg: '#2C1810', fg: '#F0DEC8', red: '#C07840',
  muted: '#9A806A', border: '#5A3820', cardBg: '#3A2216',
  danger: '#dc2626',
}

export function SystemFailureAlert() {
  const [settings, setSettings] = useSyncedState<FailureSettings>("system_failure_v1", DEFAULT_SETTINGS)
  const [completed] = useSyncedState<CompletedRecord>("daily_routine", {})
  const [morningTasks] = useSyncedState<Task[]>("morning_routine_tasks_v4", [])
  const [eveningTasks] = useSyncedState<Task[]>("evening_routine_tasks_v4", [])

  const [showSettings, setShowSettings] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!settings?.enabled) { setShowAlert(false); return }

    const todayKey = now.toISOString().split('T')[0]
    if (settings.dismissedDate === todayKey) { setShowAlert(false); return }

    const deadline = new Date(now)
    deadline.setHours(settings.deadlineHour ?? 23, settings.deadlineMinute ?? 0, 0, 0)
    if (now < deadline) { setShowAlert(false); return }

    // Check if daily routine is complete
    const jsTodayKey = now.toLocaleDateString('ja-JP')
    const allTasks = [...(morningTasks ?? []), ...(eveningTasks ?? [])]
    if (allTasks.length === 0) { setShowAlert(false); return }
    const isComplete = allTasks.every(t => (completed ?? {})[`${jsTodayKey}-${t.id}`])
    setShowAlert(!isComplete)
  }, [now, settings, completed, morningTasks, eveningTasks])

  const dismiss = () => {
    const todayKey = now.toISOString().split('T')[0]
    setSettings(prev => ({ ...(prev ?? DEFAULT_SETTINGS), dismissedDate: todayKey }))
    setShowAlert(false)
  }

  const deadlineStr = `${String(settings?.deadlineHour ?? 23).padStart(2, '0')}:${String(settings?.deadlineMinute ?? 0).padStart(2, '0')}`

  return (
    <>
      {/* Gear icon for settings (always accessible, faint) */}
      {!showAlert && (
        <button onClick={() => setShowSettings(true)}
          style={{ position: 'fixed', bottom: '1.5rem', left: '1.25rem', zIndex: 39, background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.25rem', opacity: 0.3 }}
          title="System Failure Settings"
        >
          <Settings style={{ width: '11px', height: '11px' }} />
        </button>
      )}

      {/* Full-screen Failure Overlay */}
      {showAlert && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(180,20,20,0.96)', backdropFilter: 'blur(4px)' }}>
          <div style={{ textAlign: 'center', padding: '2rem 1.5rem', maxWidth: '560px' }}>
            <AlertTriangle style={{ width: '72px', height: '72px', color: '#fff', margin: '0 auto', opacity: 0.9, marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' as const, lineHeight: 1.15, marginBottom: '0.875rem', fontFamily: 'inherit' }}>
              {settings?.message ?? DEFAULT_SETTINGS.message}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              It is past <strong>{deadlineStr}</strong> and your daily protocol remains incomplete.
            </p>
            <p style={{ fontSize: '1.5rem', marginBottom: '2.5rem' }}>
              You chose comfort over excellence today.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
              <button onClick={dismiss}
                style={{ background: 'rgba(0,0,0,0.35)', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', padding: '0.75rem 1.75rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
                I acknowledge my failure
              </button>
              <button onClick={() => setShowSettings(true)}
                style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', padding: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Settings style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowSettings(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{ position: 'relative', background: C.bg, border: `1.5px solid ${C.border}`, width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle style={{ width: '13px', height: '13px', color: C.danger }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>System Failure Config</span>
              </div>
              <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Enable toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.fg }}>Enable Alert</label>
                <button onClick={() => setSettings(prev => ({ ...(prev ?? DEFAULT_SETTINGS), enabled: !(prev?.enabled ?? true) }))}
                  style={{ background: settings?.enabled ? C.danger : C.cardBg, border: `1.5px solid ${settings?.enabled ? C.danger : C.border}`, color: settings?.enabled ? '#fff' : C.muted, padding: '0.3rem 0.75rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {settings?.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              {/* Deadline */}
              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.375rem' }}>
                  Deadline Time (JST)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="number" min={0} max={23} value={settings?.deadlineHour ?? 23}
                    onChange={e => setSettings(prev => ({ ...(prev ?? DEFAULT_SETTINGS), deadlineHour: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) }))}
                    style={{ width: '56px', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.45rem', fontSize: '0.875rem', fontFamily: 'monospace', textAlign: 'center' as const, outline: 'none' }} />
                  <span style={{ color: C.muted, fontSize: '1.125rem', fontWeight: 700 }}>:</span>
                  <input type="number" min={0} max={59} value={settings?.deadlineMinute ?? 0}
                    onChange={e => setSettings(prev => ({ ...(prev ?? DEFAULT_SETTINGS), deadlineMinute: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) }))}
                    style={{ width: '56px', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.45rem', fontSize: '0.875rem', fontFamily: 'monospace', textAlign: 'center' as const, outline: 'none' }} />
                </div>
              </div>
              {/* Message */}
              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.375rem' }}>
                  Failure Message
                </label>
                <input value={settings?.message ?? ""} onChange={e => setSettings(prev => ({ ...(prev ?? DEFAULT_SETTINGS), message: e.target.value }))}
                  style={{ width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.45rem 0.75rem', fontSize: '0.75rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <button onClick={() => setShowSettings(false)}
                style={{ background: C.red, border: `1.5px solid ${C.red}`, color: C.bg, padding: '0.7rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
