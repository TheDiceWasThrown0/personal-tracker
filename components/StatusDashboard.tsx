import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, TrendingUp, GraduationCap, Banknote, Edit2, Check, X, ChevronDown } from "lucide-react"
import { useState, useMemo } from "react"
import { subDays, format, isSameDay, parseISO, isBefore, closestTo } from "date-fns"
import { Button } from "@/components/ui/button"
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

export default function StatusDashboard() {
    // Persistent State
    const [netWorth, setNetWorth] = useSyncedState<number>("target_net_worth", 250000)
    const [netWorthHistory] = useSyncedState<any[]>("net_worth_history", [])
    const [gpa, setGpa] = useSyncedState<number>("shijun-gpa", 3.8)
    const [gmatScore, setGmatScore] = useSyncedState<number>("shijun-gmat", 680) // Baseline

    // Targets (could also be persistent if we want to change goals)
    const [gpaTarget, setGpaTarget] = useSyncedState<number>("shijun-gpa-target", 4.0)
    const [selectedPeriod, setSelectedPeriod] = useSyncedState<Period>("dashboard_trend_period", "1D")

    const [isEditing, setIsEditing] = useState(false)

    // Temporary state for editing (don't need to persist these until save)
    const [tempNetWorth, setTempNetWorth] = useState(netWorth)
    const [tempGpa, setTempGpa] = useState(gpa)
    const [tempGmatScore, setTempGmatScore] = useState(gmatScore)
    const [tempGpaTarget, setTempGpaTarget] = useState(gpaTarget)

    const handleEdit = () => {
        setTempNetWorth(netWorth)
        setTempGpa(gpa)
        setTempGpaTarget(gpaTarget)
        setTempGmatScore(gmatScore)
        setIsEditing(true)
    }

    const handleSave = () => {
        setNetWorth(tempNetWorth)
        setGpa(tempGpa)
        setGmatScore(tempGmatScore)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    // Calculate Trend
    const trendData = useMemo(() => {
        if (!netWorthHistory || netWorthHistory.length === 0) return { value: 0, label: "vs start" }

        const today = new Date()
        let targetDate: Date

        if (selectedPeriod === "1D") targetDate = subDays(today, 1)
        else if (selectedPeriod === "7D") targetDate = subDays(today, 7)
        else targetDate = subDays(today, 30)

        // Find the entry closest to the target date (but not after today)
        // We prefer extensive history, but if we don't have it, we take the earliest available
        // to show *some* growth if possible

        // precise string match first
        const targetStr = format(targetDate, "yyyy-MM-dd")
        const exactMatch = netWorthHistory.find(h => h.date === targetStr)

        let pastValue = 0
        if (exactMatch) {
            pastValue = exactMatch.value
        } else {
            // Find closest date in history
            const historyDates = netWorthHistory.map(h => parseISO(h.date))
            const closest = closestTo(targetDate, historyDates)

            if (closest) {
                const closestStr = format(closest, "yyyy-MM-dd")
                const entry = netWorthHistory.find(h => h.date === closestStr)
                if (entry) pastValue = entry.value
            }
        }

        if (pastValue === 0) return { value: 0, label: "vs start" }

        const diff = netWorth - pastValue
        const pct = (diff / pastValue) * 100

        return { value: pct, label: `vs ${selectedPeriod}` }
    }, [netWorth, netWorthHistory, selectedPeriod])

    return (
        <>
            <div className="relative mb-12">
                {isEditing && (
                    <div className="absolute -top-10 right-0 flex gap-2 z-10">
                        <button onClick={handleSave} className="bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="bg-red-400 text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isEditing ? '' : ''}`}>
                    {/* Net Worth Card */}
                    <Card
                        className={`bg-stone-800/50 backdrop-blur-md border-stone-700 shadow-xl transition-all relative overflow-hidden group ${!isEditing && 'hover:-translate-y-1 hover:border-lime-500/50 hover:shadow-lime-900/20'}`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-lime-400 uppercase tracking-wider">
                                Net Worth (JPY)
                            </CardTitle>
                            <div className="flex gap-2">
                                {!isEditing && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-[10px] font-bold bg-stone-900/50 text-stone-400 px-2 py-1 rounded hover:bg-stone-700 transition-colors flex items-center gap-1">
                                                {selectedPeriod} <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-stone-800 border-stone-700 text-stone-200">
                                            <DropdownMenuItem onClick={() => setSelectedPeriod("1D")} className="focus:bg-stone-700 cursor-pointer text-xs font-bold">Yesterday (1D)</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSelectedPeriod("7D")} className="focus:bg-stone-700 cursor-pointer text-xs font-bold">Last Week (7D)</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSelectedPeriod("30D")} className="focus:bg-stone-700 cursor-pointer text-xs font-bold">Last Month (30D)</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                <div className="p-2 bg-lime-900/30 rounded-full text-lime-400 border border-lime-500/20 cursor-pointer" onClick={() => !isEditing && handleEdit()}>
                                    <Banknote className="h-5 w-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent onClick={() => !isEditing && handleEdit()} className="cursor-pointer">
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={tempNetWorth}
                                    onChange={(e) => setTempNetWorth(Number(e.target.value))}
                                    className="w-full text-2xl font-extrabold text-lime-100 bg-black/20 rounded-lg px-2 py-1 border-2 border-lime-500/50 focus:outline-none focus:ring-2 focus:ring-lime-500"
                                />
                            ) : (
                                <div className="text-3xl font-extrabold text-lime-100">¥{netWorth.toLocaleString()}</div>
                            )}

                            <p className={`text-xs font-bold mt-2 flex items-center w-fit px-2 py-1 rounded-full border ${trendData.value >= 0 ? 'text-lime-400 bg-lime-900/20 border-lime-500/10' : 'text-red-400 bg-red-900/20 border-red-500/10'}`}>
                                <TrendingUp className={`h-3 w-3 mr-1 ${trendData.value < 0 ? 'rotate-180' : ''}`} />
                                {trendData.value >= 0 ? '+' : ''}{trendData.value.toFixed(2)}% {trendData.label}
                            </p>
                        </CardContent>
                    </Card>

                    {/* GPA Card */}
                    <Card
                        onClick={() => !isEditing && handleEdit()}
                        className={`bg-stone-800/50 backdrop-blur-md border-stone-700 shadow-xl transition-all relative overflow-hidden group ${!isEditing && 'hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-900/20 cursor-pointer'}`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                                Current GPA
                            </CardTitle>
                            <div className="p-2 bg-blue-900/30 rounded-full text-blue-400 border border-blue-500/20">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="flex items-end gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tempGpa}
                                        onChange={(e) => setTempGpa(Number(e.target.value))}
                                        className="w-24 text-2xl font-extrabold text-blue-100 bg-black/20 rounded-lg px-2 py-1 border-2 border-blue-500/50 focus:outline-none"
                                    />
                                    <span className="text-xl font-bold text-blue-400/50 mb-2">/ 4.0</span>
                                </div>
                            ) : (
                                <div className="text-3xl font-extrabold text-blue-100">{gpa.toFixed(1)} / 4.0</div>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs font-bold text-blue-400 bg-blue-900/20 w-fit px-2 py-1 rounded-full whitespace-nowrap border border-blue-500/10">
                                    Target:
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={tempGpaTarget}
                                            onChange={(e) => setTempGpaTarget(Number(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-12 ml-1 bg-transparent border-b border-blue-500 text-center focus:outline-none text-blue-200"
                                        />
                                    ) : (
                                        <span className="ml-1 text-blue-200">{gpaTarget}+</span>
                                    )}
                                    (Sophia)
                                </span>
                            </div>

                            <div className="w-full bg-stone-900 h-3 mt-3 rounded-full overflow-hidden border border-stone-700">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(gpa / 4.0) * 100}%` }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GMAT Card */}
                    <Card
                        onClick={() => !isEditing && handleEdit()}
                        className={`bg-stone-800/50 backdrop-blur-md border-stone-700 shadow-xl transition-all relative overflow-hidden group ${!isEditing && 'hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-amber-900/20 cursor-pointer'}`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                                GMAT Focus Target
                            </CardTitle>
                            <div className="p-2 bg-amber-900/30 rounded-full text-amber-500 border border-amber-500/20">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={tempGmatScore}
                                    onChange={(e) => setTempGmatScore(Number(e.target.value))}
                                    className="w-full text-2xl font-extrabold text-amber-100 bg-black/20 rounded-lg px-2 py-1 border-2 border-amber-500/50 focus:outline-none"
                                />
                            ) : (
                                <div className="text-3xl font-extrabold text-amber-100">{gmatScore}+</div>
                            )}
                            <p className="text-xs font-bold text-amber-500 mt-2 bg-amber-900/20 w-fit px-2 py-1 rounded-full border border-amber-500/10">
                                Expected Exam: Q3 2027
                            </p>
                            <div className="w-full bg-stone-900 h-3 mt-3 rounded-full overflow-hidden border border-stone-700">
                                {/* Assuming max score is 805 for Focus Edition, linear scale approx */}
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(gmatScore / 805) * 100}%` }}></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-8">
                <NotificationManager />
            </div>
        </>
    )
}
