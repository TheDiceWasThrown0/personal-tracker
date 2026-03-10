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

type Period = "1D" | "7D" | "30D"

function StatCard({ children, accent }: { children: React.ReactNode; accent?: string }) {
    return (
        <div
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: 'hsl(24 7% 11%)', border: '1px solid hsl(24 6% 17%)' }}
        >
            {children}
        </div>
    )
}

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
        const exact = netWorthHistory.find(h => h.date === targetStr)
        let pastValue = 0
        if (exact) {
            pastValue = exact.value
        } else {
            const dates = netWorthHistory.map(h => parseISO(h.date))
            const closest = closestTo(targetDate, dates)
            if (closest) {
                const entry = netWorthHistory.find(h => h.date === format(closest, "yyyy-MM-dd"))
                if (entry) pastValue = entry.value
            }
        }
        if (!pastValue) return { value: 0, positive: true }
        const pct = ((netWorth - pastValue) / pastValue) * 100
        return { value: pct, positive: pct >= 0 }
    }, [netWorth, netWorthHistory, selectedPeriod])

    const inputStyle = {
        background: 'hsl(24 7% 14%)',
        border: '1px solid hsl(24 6% 22%)',
        color: 'hsl(30 18% 88%)',
        borderRadius: '0.5rem',
        padding: '0.375rem 0.625rem',
        outline: 'none',
        width: '100%',
    }

    return (
        <>
            <div className="relative">
                {/* Edit / Save controls */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(30 8% 38%)' }}>Status</p>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors" style={{ background: '#e06d34', color: '#fff' }}>
                                    <Check className="w-3 h-3" /> Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors" style={{ background: 'hsl(24 7% 16%)', color: 'hsl(30 8% 50%)', border: '1px solid hsl(24 6% 20%)' }}>
                                    <X className="w-3 h-3" />
                                </button>
                            </>
                        ) : (
                            <button onClick={handleEdit} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors" style={{ background: 'hsl(24 7% 16%)', color: 'hsl(30 8% 50%)', border: '1px solid hsl(24 6% 20%)' }}>
                                <Edit2 className="w-3 h-3" /> Edit
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Net Worth */}
                    <StatCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(30 8% 42%)' }}>Net Worth (JPY)</span>
                            <div className="flex items-center gap-2">
                                {!isEditing && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'hsl(24 7% 16%)', color: 'hsl(30 8% 50%)', border: '1px solid hsl(24 6% 20%)' }}>
                                                {selectedPeriod} <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent style={{ background: 'hsl(24 7% 13%)', border: '1px solid hsl(24 6% 18%)' }}>
                                            {(["1D", "7D", "30D"] as Period[]).map(p => (
                                                <DropdownMenuItem key={p} onClick={() => setSelectedPeriod(p)} className="text-xs font-medium cursor-pointer" style={{ color: 'hsl(30 18% 75%)' }}>
                                                    {p === "1D" ? "Yesterday" : p === "7D" ? "Last week" : "Last month"}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                <Banknote className="w-4 h-4" style={{ color: '#e06d34' }} />
                            </div>
                        </div>

                        {isEditing ? (
                            <input type="number" value={tempNetWorth} onChange={e => setTempNetWorth(Number(e.target.value))} style={{ ...inputStyle, fontSize: '1.25rem', fontWeight: 700 }} />
                        ) : (
                            <p className="text-2xl font-bold tabular-nums" style={{ color: 'hsl(30 18% 92%)' }}>¥{netWorth.toLocaleString()}</p>
                        )}

                        <div className="flex items-center gap-1.5">
                            {trendData.positive
                                ? <TrendingUp className="w-3 h-3" style={{ color: '#4ade80' }} />
                                : <TrendingDown className="w-3 h-3" style={{ color: '#f87171' }} />
                            }
                            <span className="text-xs font-medium" style={{ color: trendData.positive ? '#4ade80' : '#f87171' }}>
                                {trendData.value >= 0 ? '+' : ''}{trendData.value.toFixed(2)}% vs {selectedPeriod}
                            </span>
                        </div>
                    </StatCard>

                    {/* GPA */}
                    <StatCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(30 8% 42%)' }}>GPA</span>
                            <GraduationCap className="w-4 h-4" style={{ color: '#60a5fa' }} />
                        </div>

                        {isEditing ? (
                            <div className="flex gap-2 items-center">
                                <input type="number" step="0.01" value={tempGpa} onChange={e => setTempGpa(Number(e.target.value))} style={{ ...inputStyle, fontSize: '1.25rem', fontWeight: 700, width: '80px' }} />
                                <span style={{ color: 'hsl(30 8% 42%)' }}>/</span>
                                <input type="number" step="0.1" value={tempGpaTarget} onChange={e => setTempGpaTarget(Number(e.target.value))} style={{ ...inputStyle, width: '70px' }} placeholder="target" />
                            </div>
                        ) : (
                            <p className="text-2xl font-bold tabular-nums" style={{ color: 'hsl(30 18% 92%)' }}>{gpa.toFixed(1)} <span className="text-base font-normal" style={{ color: 'hsl(30 8% 42%)' }}>/ {gpaTarget}</span></p>
                        )}

                        <div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(24 7% 18%)' }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${(gpa / gpaTarget) * 100}%`, background: '#60a5fa' }} />
                            </div>
                            <p className="text-[11px] mt-1.5" style={{ color: 'hsl(30 8% 40%)' }}>Target: {gpaTarget}+ (Sophia)</p>
                        </div>
                    </StatCard>

                    {/* GMAT */}
                    <StatCard>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(30 8% 42%)' }}>GMAT Focus</span>
                            <ArrowUpRight className="w-4 h-4" style={{ color: '#f59e0b' }} />
                        </div>

                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <input type="number" value={tempGmatScore} onChange={e => setTempGmatScore(Number(e.target.value))} style={{ ...inputStyle, fontSize: '1.25rem', fontWeight: 700 }} />
                                <input type="text" value={tempGmatExamDate} onChange={e => setTempGmatExamDate(e.target.value)} style={inputStyle} placeholder="Exam date e.g. Q3 2027" />
                            </div>
                        ) : (
                            <p className="text-2xl font-bold tabular-nums" style={{ color: 'hsl(30 18% 92%)' }}>{gmatScore}<span className="text-base font-normal" style={{ color: 'hsl(30 8% 42%)' }}>+</span></p>
                        )}

                        <div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(24 7% 18%)' }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${(gmatScore / 805) * 100}%`, background: '#f59e0b' }} />
                            </div>
                            <p className="text-[11px] mt-1.5" style={{ color: 'hsl(30 8% 40%)' }}>Exam: {gmatExamDate}</p>
                        </div>
                    </StatCard>
                </div>
            </div>

            <div className="mt-8">
                <NotificationManager />
            </div>
        </>
    )
}
