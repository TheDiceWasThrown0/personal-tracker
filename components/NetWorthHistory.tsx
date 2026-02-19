"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { format } from "date-fns"

type HistoryEntry = {
    date: string
    value: number
}

export function NetWorthHistory() {
    const [history] = useSyncedState<HistoryEntry[]>("net_worth_history", [])

    // Calculate current net worth (last entry)
    const currentNetWorth = history.length > 0 ? history[history.length - 1].value : 0
    const previousNetWorth = history.length > 1 ? history[history.length - 2].value : currentNetWorth
    const delta = currentNetWorth - previousNetWorth
    const deltaPercent = previousNetWorth > 0 ? (delta / previousNetWorth) * 100 : 0

    return (
        <Card className="bg-white border-2 border-stone-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-sky-500" />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-end">
                    <CardTitle className="text-sm font-extrabold text-stone-400 uppercase tracking-widest">
                        Net Worth Trajectory
                    </CardTitle>
                    <div className="text-right">
                        <div className="text-2xl font-black text-stone-700">
                            ¥{currentNetWorth.toLocaleString()}
                        </div>
                        <div className={`text-xs font-bold ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {delta >= 0 ? '+' : ''}{delta.toLocaleString()} ({deltaPercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full mt-4">
                    {history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    tickFormatter={(val) => format(new Date(val), "MMM d")}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    formatter={(value: any) => [`¥${Number(value).toLocaleString()}`, "Net Worth"]}
                                    labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-stone-300 text-sm font-bold italic">
                            No history data yet. Update your assets to start tracking.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
