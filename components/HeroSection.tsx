"use client"

import { useEffect, useState } from "react"
import { intervalToDuration, type Duration } from "date-fns"
import { useSyncedState } from "@/hooks/useSyncedState"
import { Edit2, Check, X } from "lucide-react"

const C = { bg: '#FDF6E3', fg: '#5C4033', red: '#78C8A1', muted: '#A19385', border: '#5C4033', cardBg: '#FFFFFF', softBorder: '#D6CDC4' }
const UNITS = ["years", "months", "days", "hours", "minutes", "seconds"] as const

export function HeroSection() {
    const [targetDateStr, setTargetDateStr] = useSyncedState<string>("hero_targetDate", "2029-09-01T00:00:00")
    const [countdownLabel, setCountdownLabel] = useSyncedState<string>("hero_label", "Countdown to Bocconi")
    const [timeLeft, setTimeLeft] = useState<Duration>({})
    const [isEditing, setIsEditing] = useState(false)
    const [tempLabel, setTempLabel] = useState(countdownLabel)
    const [tempDate, setTempDate] = useState(targetDateStr)

    useEffect(() => {
        const targetDate = new Date(targetDateStr)
        const timer = setInterval(() => {
            const now = new Date()
            if (now >= targetDate) { setTimeLeft({}); return }
            setTimeLeft(intervalToDuration({ start: now, end: targetDate }))
        }, 1000)
        return () => clearInterval(timer)
    }, [targetDateStr])

    const formatTime = (val: number | undefined) => (val || 0).toString().padStart(2, "0")

    const handleSave = () => {
        setTargetDateStr(tempDate)
        setCountdownLabel(tempLabel)
        setIsEditing(false)
    }

    return (
        <div style={{ border: `1.5px solid ${C.border}` }}>
            {/* Header */}
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.cardBg }}>
                {isEditing ? (
                    <input
                        value={tempLabel}
                        onChange={e => setTempLabel(e.target.value)}
                        className="input-line"
                        style={{ flex: 1, marginRight: '1rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                        autoFocus
                    />
                ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.fg }}>
                        {countdownLabel}
                    </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {isEditing ? (
                        <>
                            <input
                                type="datetime-local"
                                value={tempDate}
                                onChange={e => setTempDate(e.target.value)}
                                className="input-line"
                                style={{ width: 'auto', fontSize: '0.7rem' }}
                            />
                            <button onClick={handleSave} className="btn-wire" style={{ padding: '0.2rem 0.5rem' }}>
                                <Check style={{ width: '11px', height: '11px' }} />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="btn-wire" style={{ padding: '0.2rem 0.5rem' }}>
                                <X style={{ width: '11px', height: '11px' }} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { setTempLabel(countdownLabel); setTempDate(targetDateStr); setIsEditing(true); }} className="btn-wire" style={{ padding: '0.2rem 0.5rem' }}>
                            <Edit2 style={{ width: '11px', height: '11px' }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Countdown grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', background: C.bg }}>
                {UNITS.map((unit, i) => (
                    <div
                        key={unit}
                        style={{
                            padding: '1.5rem 0.5rem',
                            textAlign: 'center',
                            borderRight: i < 5 ? `1.5px solid ${C.border}` : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {/* @ts-ignore */}
                        <span style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: unit === 'days' ? C.red : C.fg }}>
                            {formatTime(timeLeft[unit as keyof Duration])}
                        </span>
                        <span style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted }}>
                            {unit}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
