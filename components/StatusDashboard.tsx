import { useSyncedState } from "@/hooks/useSyncedState"
import { ArrowUpRight, TrendingUp, TrendingDown, GraduationCap, Banknote, Edit2, Check, X, ChevronDown } from "lucide-react"
import { useState, useMemo } from "react"
import { subDays, format, parseISO, closestTo } from "date-fns"
import dynamic from 'next/dynamic'
const NotificationManager = dynamic(
    () => import('./NotificationManager').then(mod => mod.NotificationManager),
    { ssr: false }
)
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const C = { bg: '#FDF6E3', fg: '#5C4033', red: '#78C8A1', muted: '#A19385', border: '#5C4033', cardBg: '#FFFFFF', softBorder: '#D6CDC4' }

type Period = "1D" | "7D" | "30D"

export default function StatusDashboard() {
    const [netWorth, setNetWorth] = useSyncedState<number>("target_net_worth", 250000)
    const [netWorthHistory] = useSyncedState<any[]>("net_worth_history", [])
    const [gpa, setGpa] = useSyncedState<number>("shijun-gpa", 3.8)
    const [gmatScore, setGmatScore] = useSyncedState<number>("shijun-gmat", 680)
    const [gpaTarget, setGpaTarget] = useSyncedState<number>("shijun-gpa-target", 4.0)
    const [gmatExamDate, setGmatExamDate] = useSyncedState<string>("shijun-gmat-exam-date", "Q3 2027")
    const [selectedPeriod, setSelectedPeriod] = useSyncedState<Period>("dashboard_trend_period", "1D")
    const [isEditing, setIsEditing] = useState(false)

    const [tempNetWorth, setTempNetWorth] = useState(netWorth)
    const [tempGpa, setTempGpa] = useState(gpa)
    const [tempGmatScore, setTempGmatScore] = useState(gmatScore)
    const [tempGpaTarget, setTempGpaTarget] = useState(gpaTarget)
    const [tempGmatExamDate, setTempGmatExamDate] = useState(gmatExamDate)

    const handleEdit = () => {
        setTempNetWorth(netWorth); setTempGpa(gpa)
        setTempGpaTarget(gpaTarget); setTempGmatScore(gmatScore)
        setTempGmatExamDate(gmatExamDate); setIsEditing(true)
    }
    const handleSave = () => {
        setNetWorth(tempNetWorth); setGpa(tempGpa)
        setGpaTarget(tempGpaTarget); setGmatScore(tempGmatScore)
        setGmatExamDate(tempGmatExamDate); setIsEditing(false)
    }

    const trendData = useMemo(() => {
        if (!netWorthHistory?.length) return { value: 0, positive: true }
        const today = new Date()
        const daysMap = { "1D": 1, "7D": 7, "30D": 30 }
        const targetDate = subDays(today, daysMap[selectedPeriod])
        const targetStr = format(targetDate, "yyyy-MM-dd")
        const exact = netWorthHistory.find((h: any) => h.date === targetStr)
        let pastValue = 0
        if (exact) {
            pastValue = exact.value
        } else {
            const dates = netWorthHistory.map((h: any) => parseISO(h.date))
            const closest = closestTo(targetDate, dates)
            if (closest) {
                const entry = netWorthHistory.find((h: any) => h.date === format(closest, "yyyy-MM-dd"))
                if (entry) pastValue = entry.value
            }
        }
        if (!pastValue) return { value: 0, positive: true }
        const pct = ((netWorth - pastValue) / pastValue) * 100
        return { value: pct, positive: pct >= 0 }
    }, [netWorth, netWorthHistory, selectedPeriod])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Section header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted }}>Status</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="btn-wire"><Check style={{ width: '11px', height: '11px' }} /> Save</button>
                            <button onClick={() => setIsEditing(false)} className="btn-wire"><X style={{ width: '11px', height: '11px' }} /></button>
                        </>
                    ) : (
                        <button onClick={handleEdit} className="btn-wire"><Edit2 style={{ width: '11px', height: '11px' }} /> Edit</button>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: `1.5px solid ${C.border}` }}>

                {/* Net Worth */}
                <div style={{ padding: '1.25rem', borderRight: `1.5px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>Net Worth (JPY)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {!isEditing && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="btn-wire" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6rem' }}>
                                            {selectedPeriod} <ChevronDown style={{ width: '10px', height: '10px' }} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 0, minWidth: '120px' }}>
                                        {(["1D", "7D", "30D"] as Period[]).map(p => (
                                            <DropdownMenuItem key={p} onClick={() => setSelectedPeriod(p)} style={{ fontSize: '0.7rem', fontFamily: 'inherit', cursor: 'pointer', color: C.fg }}>
                                                {p === "1D" ? "Yesterday" : p === "7D" ? "Last week" : "Last month"}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            <Banknote style={{ width: '14px', height: '14px', color: C.red }} />
                        </div>
                    </div>

                    {isEditing ? (
                        <input type="number" value={tempNetWorth} onChange={e => setTempNetWorth(Number(e.target.value))} className="input-line" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }} />
                    ) : (
                        <p style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>¥{netWorth.toLocaleString()}</p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {trendData.positive
                            ? <TrendingUp style={{ width: '12px', height: '12px', color: '#16a34a' }} />
                            : <TrendingDown style={{ width: '12px', height: '12px', color: C.red }} />
                        }
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: trendData.positive ? '#16a34a' : C.red }}>
                            {trendData.value >= 0 ? '+' : ''}{trendData.value.toFixed(2)}% vs {selectedPeriod}
                        </span>
                    </div>
                </div>

                {/* GPA */}
                <div style={{ padding: '1.25rem', borderRight: `1.5px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>GPA</span>
                        <GraduationCap style={{ width: '14px', height: '14px', color: C.fg }} />
                    </div>

                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                            <input type="number" step="0.01" value={tempGpa} onChange={e => setTempGpa(Number(e.target.value))} className="input-line" style={{ fontSize: '1.5rem', fontWeight: 800, width: '70px' }} />
                            <span style={{ color: C.muted, marginBottom: '4px' }}>/</span>
                            <input type="number" step="0.1" value={tempGpaTarget} onChange={e => setTempGpaTarget(Number(e.target.value))} className="input-line" style={{ width: '60px' }} placeholder="target" />
                        </div>
                    ) : (
                        <p style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                            {gpa.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 400, color: C.muted }}>/ {gpaTarget}</span>
                        </p>
                    )}

                    <div style={{ width: '100%', height: '2px', background: C.softBorder, marginBottom: '0.375rem' }}>
                        <div style={{ height: '100%', background: C.fg, width: `${(gpa / gpaTarget) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
                    <p style={{ fontSize: '0.6rem', color: C.muted }}>Target: {gpaTarget}+ (Sophia)</p>
                </div>

                {/* GMAT */}
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>GMAT Focus</span>
                        <ArrowUpRight style={{ width: '14px', height: '14px', color: C.red }} />
                    </div>

                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <input type="number" value={tempGmatScore} onChange={e => setTempGmatScore(Number(e.target.value))} className="input-line" style={{ fontSize: '1.5rem', fontWeight: 800 }} />
                            <input type="text" value={tempGmatExamDate} onChange={e => setTempGmatExamDate(e.target.value)} className="input-line" placeholder="e.g. Q3 2027" />
                        </div>
                    ) : (
                        <p style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                            {gmatScore}<span style={{ fontSize: '1rem', fontWeight: 400, color: C.muted }}>+</span>
                        </p>
                    )}

                    <div style={{ width: '100%', height: '2px', background: C.softBorder, marginBottom: '0.375rem' }}>
                        <div style={{ height: '100%', background: C.red, width: `${(gmatScore / 805) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
                    <p style={{ fontSize: '0.6rem', color: C.muted }}>Exam: {gmatExamDate}</p>
                </div>

            </div>

            <div style={{ marginTop: '0.5rem' }}>
                <NotificationManager />
            </div>
        </div>
    )
}
