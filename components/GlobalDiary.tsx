"use client"

import { useState, useEffect } from "react"
import { useSyncedState } from "@/hooks/useSyncedState"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BookOpen, ChevronLeft, ChevronRight, Save, Check } from "lucide-react"
import { format, addDays, subDays, isToday } from "date-fns"

const C = { bg: '#1a1410', fg: '#e8e2d8', red: '#bf1a0a', muted: '#9a9080', border: '#3b3228', cardBg: '#2a241c', softBorder: '#4a4035' }

type DiaryEntries = Record<string, string>

export function GlobalDiary() {
    const [entries, setEntries] = useSyncedState<DiaryEntries>("diary_entries_v1", {})
    const [isOpen, setIsOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [note, setNote] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const dateKey = format(currentDate, "yyyy-MM-dd")

    useEffect(() => {
        setNote(entries[dateKey] || "")
    }, [dateKey, entries, isOpen])

    const handleSave = () => {
        setIsSaving(true)
        setEntries(prev => ({ ...prev, [dateKey]: note }))
        setTimeout(() => setIsSaving(false), 800)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button
                    className="btn-wire fixed bottom-56 lg:bottom-32 right-6 z-[70] w-11 h-11 p-0 flex items-center justify-center"
                    title="Captain's Log"
                >
                    <BookOpen style={{ width: '16px', height: '16px' }} />
                </button>
            </SheetTrigger>

            <SheetContent
                style={{
                    width: '480px',
                    background: C.bg,
                    borderLeft: `1.5px solid ${C.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 0,
                    fontFamily: 'var(--font-jetbrains), monospace',
                    padding: 0,
                }}
            >
                <SheetHeader style={{ padding: '1rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, background: C.cardBg }}>
                    <SheetTitle style={{ fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                onClick={() => setCurrentDate(subDays(currentDate, 1))}
                                className="btn-wire"
                                style={{ padding: '0.2rem 0.4rem' }}
                            >
                                <ChevronLeft style={{ width: '13px', height: '13px' }} />
                            </button>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: C.fg, minWidth: '130px', textAlign: 'center' }}>
                                {format(currentDate, "MMM do, yyyy")}
                            </span>
                            <button
                                onClick={() => setCurrentDate(addDays(currentDate, 1))}
                                className="btn-wire"
                                style={{ padding: '0.2rem 0.4rem' }}
                            >
                                <ChevronRight style={{ width: '13px', height: '13px' }} />
                            </button>
                        </div>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
                            Captain's Log
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Write your daily thoughts, ideas, or manifestos here..."
                            style={{
                                width: '100%',
                                height: '100%',
                                resize: 'none',
                                background: 'transparent',
                                border: `1.5px solid ${C.softBorder}`,
                                borderTop: `1.5px solid ${C.border}`,
                                outline: 'none',
                                fontFamily: 'inherit',
                                fontSize: '0.8rem',
                                lineHeight: 1.8,
                                color: C.fg,
                                padding: '0.875rem',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = C.border; }}
                            spellCheck={false}
                        />
                        {isSaving && (
                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Check style={{ width: '10px', height: '10px' }} /> Saved
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        className="btn-wire"
                        disabled={note === (entries[dateKey] || "")}
                        style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
                    >
                        <Save style={{ width: '12px', height: '12px' }} />
                        Save Entry
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
