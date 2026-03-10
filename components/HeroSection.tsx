"use client"

import { useEffect, useState } from "react"
import { intervalToDuration, type Duration } from "date-fns"
import { useSyncedState } from "@/hooks/useSyncedState"
import { Edit2, Check } from "lucide-react"

const UNITS = ["years", "months", "days", "hours", "minutes", "seconds"] as const

export function HeroSection() {
    const [targetDateStr, setTargetDateStr] = useSyncedState<string>("hero_targetDate", "2029-09-01T00:00:00")
    const [countdownLabel, setCountdownLabel] = useSyncedState<string>("hero_label", "Countdown to Bocconi")
    const [timeLeft, setTimeLeft] = useState<Duration>({})
    const [isEditing, setIsEditing] = useState(false)
    const [tempLabel, setTempLabel] = useState(countdownLabel)
    const [tempDate, setTempDate] = useState(targetDateStr)

    const targetDate = new Date(targetDateStr)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            if (now >= targetDate) {
                setTimeLeft({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
                return
            }
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
        <div
            className="w-full rounded-2xl overflow-hidden relative group"
            style={{ background: 'hsl(24 7% 11%)', border: '1px solid hsl(24 6% 17%)' }}
        >
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid hsl(24 6% 15%)' }}>
                {isEditing ? (
                    <input
                        value={tempLabel}
                        onChange={e => setTempLabel(e.target.value)}
                        className="bg-transparent text-sm font-semibold focus:outline-none w-full mr-4"
                        style={{ color: 'hsl(30 18% 88%)' }}
                        autoFocus
                    />
                ) : (
                    <p className="text-sm font-semibold" style={{ color: 'hsl(30 18% 88%)' }}>{countdownLabel}</p>
                )}

                {isEditing ? (
                    <div className="flex items-center gap-2 shrink-0">
                        <input
                            type="datetime-local"
                            value={tempDate}
                            onChange={e => setTempDate(e.target.value)}
                            className="text-xs rounded-lg px-2 py-1 focus:outline-none"
                            style={{ background: 'hsl(24 7% 16%)', border: '1px solid hsl(24 6% 22%)', color: 'hsl(30 18% 80%)' }}
                        />
                        <button
                            onClick={handleSave}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: '#e06d34', color: '#fff' }}
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => { setTempLabel(countdownLabel); setTempDate(targetDateStr); setIsEditing(true); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: 'hsl(30 8% 45%)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#e06d34')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'hsl(30 8% 45%)')}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Countdown grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 px-6 py-6 gap-4">
                {UNITS.map(unit => (
                    <div key={unit} className="flex flex-col items-center gap-1.5">
                        <div
                            className="w-full rounded-xl flex items-center justify-center py-4"
                            style={{ background: 'hsl(24 7% 14%)', border: '1px solid hsl(24 6% 19%)' }}
                        >
                            <span
                                className="text-2xl md:text-3xl font-bold tabular-nums"
                                style={{ color: unit === 'days' ? '#e06d34' : 'hsl(30 18% 88%)' }}
                            >
                                {/* @ts-ignore */}
                                {formatTime(timeLeft[unit])}
                            </span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'hsl(30 8% 42%)' }}>
                            {unit}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
