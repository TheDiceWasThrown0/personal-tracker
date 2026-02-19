"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Save, X, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

const initialData: DataItem[] = [
    { name: "Cash (Tuition/Safety)", value: 4000000, color: "#94a3b8" }, // Slate 400
    { name: "S&P 500 ETF", value: 1500000, color: "#10b981" }, // Emerald 500
    { name: "Crypto (ETH/SOL)", value: 500000, color: "#8b5cf6" }, // Violet 500
    { name: "Venture/Angel", value: 0, color: "#f59e0b" }, // Amber 500
]

type DataItem = {
    name: string
    value: number
    color?: string
}

import { format } from "date-fns"

export function AssetAllocationChart() {
    const [data, setData] = useSyncedState("asset_data_v4", initialData)
    const [targetNetWorth, setTargetNetWorth] = useSyncedState<number>("target_net_worth", 0)
    const [history, setHistory] = useSyncedState<any[]>("net_worth_history", [])
    const [isEditing, setIsEditing] = useState(false)

    // Temp state for editing
    const [tempData, setTempData] = useState(data)
    const [tempTarget, setTempTarget] = useState(targetNetWorth)

    // Calculate totals
    const currentAllocated = data.reduce((acc: number, item: any) => acc + (Number(item.value) || 0), 0)
    const unallocated = targetNetWorth - currentAllocated

    // Prepare chart data with Unallocated slice
    const chartData = [...data]
    if (unallocated > 0) {
        chartData.push({ name: "Unallocated (Cash?)", value: unallocated, color: "#e2e8f0" }) // Slate 200
    }

    const handleEdit = () => {
        setTempData(data)
        setTempTarget(targetNetWorth)
        setIsEditing(true)
    }

    const handleSave = () => {
        setData(tempData)
        setTargetNetWorth(tempTarget)
        setIsEditing(false)

        // Use Target Net Worth for history if set, otherwise sum of assets
        // Actually, if we are in "allocator mode", the Target IS the net worth.
        const totalValue = tempTarget > 0 ? tempTarget : tempData.reduce((acc: number, item: any) => acc + (Number(item.value) || 0), 0)

        const today = format(new Date(), "yyyy-MM-dd")

        // Update history
        const newHistory = [...history]
        const lastEntry = newHistory[newHistory.length - 1]

        if (lastEntry && lastEntry.date === today) {
            newHistory[newHistory.length - 1] = { date: today, value: totalValue }
        } else {
            newHistory.push({ date: today, value: totalValue })
        }
        setHistory(newHistory)
    }

    const updateItem = (index: number, field: string, val: string | number) => {
        const newData = tempData.map((item: any, i: number) => {
            if (i === index) {
                return { ...item, [field]: val }
            }
            return item
        })
        setTempData(newData)
    }

    const removeItem = (index: number) => {
        setTempData(tempData.filter((_, i) => i !== index))
    }

    const addItem = () => {
        setTempData([...tempData, { name: "New Asset", value: 0, color: "#cbd5e1" }])
    }

    // derived calc for edit mode
    const editTotalAllocated = tempData.reduce((acc: number, item: any) => acc + (Number(item.value) || 0), 0)
    const editUnallocated = tempTarget - editTotalAllocated

    return (
        <Card className="col-span-1 h-full bg-white border-4 border-slate-100 shadow-[4px_4px_0px_0px_#cbd5e1] relative group overflow-visible">
            {/* Edit Button Overlay */}
            <div className="absolute -top-3 -right-3 z-10">
                {isEditing ? (
                    <div className="flex gap-1">
                        <button onClick={handleSave} className="bg-primary text-white p-2 rounded-full shadow-md hover:scale-110">
                            <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="bg-red-400 text-white p-2 rounded-full shadow-md hover:scale-110">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button onClick={handleEdit} className="bg-white text-stone-400 p-2 rounded-full border border-stone-200 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-primary">
                        <Edit2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <CardHeader>
                <CardTitle className="text-sm font-extrabold text-slate-500 uppercase tracking-widest text-center">
                    Asset Allocation
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="h-[300px] w-full overflow-y-auto pr-2 space-y-2">
                        <div className="bg-slate-100 p-3 rounded-xl mb-4 border border-slate-200">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Total Net Worth Pool</label>
                            <input
                                type="number"
                                className="w-full text-lg font-black text-slate-800 bg-white border border-slate-300 rounded px-2 py-1"
                                value={tempTarget}
                                onChange={(e) => setTempTarget(Number(e.target.value))}
                            />
                            <div className="flex justify-between mt-2 text-xs font-bold">
                                <span className="text-slate-400">Allocated: <span className="text-slate-600">¥{editTotalAllocated.toLocaleString()}</span></span>
                                <span className={editUnallocated < 0 ? "text-red-500" : "text-emerald-500"}>
                                    {editUnallocated < 0 ? "Over Limit: " : "Remaining: "}
                                    ¥{Math.abs(editUnallocated).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {tempData.map((item: any, i: number) => (
                            <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <input
                                    type="color"
                                    value={item.color}
                                    onChange={(e) => updateItem(i, 'color', e.target.value)}
                                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                                />
                                <div className="flex-1 space-y-1">
                                    <input
                                        className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded px-1"
                                        value={item.name}
                                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="w-full text-xs font-mono text-slate-500 bg-white border border-slate-200 rounded px-1"
                                        value={item.value}
                                        onChange={(e) => updateItem(i, 'value', Number(e.target.value))}
                                    />
                                </div>
                                <button onClick={() => removeItem(i)} className="text-red-300 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs font-bold hover:border-primary hover:text-primary flex items-center justify-center gap-1">
                            <Plus className="w-3 h-3" /> Add Asset
                        </button>
                    </div>
                ) : (
                    <div className="h-[300px] w-full relative">
                        {unallocated !== 0 && (
                            <div className="absolute top-0 left-0 w-full text-center z-10 pointer-events-none">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${unallocated < 0 ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                                    {unallocated < 0 ? `Over: ¥${Math.abs(unallocated).toLocaleString()}` : `Unallocated: ¥${unallocated.toLocaleString()}`}
                                </span>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart key={`pie-${data.length}-${JSON.stringify(data)}-${targetNetWorth}`}>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={10}
                                >
                                    {/* @ts-ignore */}
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "16px", borderColor: "#e2e8f0", color: "#1e293b", fontWeight: "bold", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    itemStyle={{ color: "#1e293b" }}
                                    formatter={(value: any) => `¥${(Number(value) || 0).toLocaleString()}`}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: "600", color: "#64748b" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
