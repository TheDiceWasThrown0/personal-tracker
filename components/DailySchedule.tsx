import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Power, Brain, GraduationCap, Zap, Activity, ListTodo, Moon,
    BatteryWarning, Clock, AlertCircle, Save, Plus, Trash2, ArrowUp, ArrowDown
} from "lucide-react"
import { useSyncedState } from "@/hooks/useSyncedState"

const iconMap: Record<string, any> = {
    Power, Brain, GraduationCap, Zap, Activity, ListTodo, Moon, BatteryWarning, Clock, AlertCircle
}

const themeMap: Record<string, { color: string, bg: string, border: string }> = {
    red: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    orange: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    blue: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    yellow: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    emerald: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    stone: { color: "text-stone-400", bg: "bg-stone-500/10", border: "border-stone-500/20" },
    indigo: { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    purple: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" }
}

const defaultSchedule = [
    { time: "06:00", title: "強制再起動", description: "スヌーズ機能は甘えです。アラームと同時に起床し、5分以内に冷水で顔を洗い、日光を目に入れます。", icon: "Power", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { time: "06:15 - 07:00", title: "ドーパミン遮断・脳のアイドリング", description: "朝のこの時間はスマホの通知確認やSNSを一切禁じます。前日の復習や、その日の最も重要な思考タスクの整理（1日の計画）にのみ使います。", icon: "Brain", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { time: "08:00 - 学校終了まで", title: "外部環境への適応", description: "学校の時間は社会的な拘束時間です。無駄なエネルギーを消費せず、淡々とタスク（学業や人間関係）をこなすことに徹してください。", icon: "GraduationCap", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { time: "学校終了後 〜 19:00", title: "ディープ・ワーク（深沈思の実行）", description: "ここが勝負の分かれ目です。帰宅して「少し休む」という選択肢はシステム上存在しません。帰宅した瞬間に机に向かい、その日最も負荷の高い勉強や作業を連続して行います。火曜・水曜はこの時間が長く取れるため、ここで1週間分のアドバンテージを稼ぎます。", icon: "Zap", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { time: "19:00 - 20:30", title: "肉体とシステムのメンテナンス", description: "夕食、入浴、軽いストレッチなどの物理的なメンテナンス時間です。ここで初めて、脳を休めるための「意図的なリラックス」を許可します。", icon: "Activity", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { time: "20:30 - 21:30", title: "シャロー・ワーク（浅い作業）と翌日の準備", description: "単純作業や、カバンの中身の整理、明日の着替えの準備など、脳のエネルギーを使わない作業をすべてここで終わらせます。", icon: "ListTodo", color: "text-stone-400", bg: "bg-stone-500/10", border: "border-stone-500/20" },
    { time: "21:30 - 22:30", title: "デジタル・サンセット（強制隔離への移行）", description: "21時30分をもって、すべてのブルーライト（スマホ、PC）への接触を禁じます。照明を暗くし、読書や瞑想など、脳の活動を強制的にクールダウンさせる儀式を行います。", icon: "BatteryWarning", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { time: "22:30", title: "システム・シャットダウン（完全就寝）", description: "23時ではなく、22時30分に目を閉じます。これで翌朝6時まで、完璧な7.5時間の睡眠サイクルを確保します。", icon: "Moon", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" }
]

export function DailySchedule() {
    const [scheduleItems, setScheduleItems] = useSyncedState<any[]>("daily_schedule_items_v1", defaultSchedule)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editItem, setEditItem] = useState<any | null>(null)

    const itemsToRender = Array.isArray(scheduleItems) ? scheduleItems : defaultSchedule;

    const handleItemClick = (index: number) => {
        if (editingIndex !== null) return; // Ignore if already editing an item
        setEditingIndex(index)
        setEditItem({ ...itemsToRender[index] })
    }

    const handleSaveClick = async (index: number) => {
        const newItems = [...itemsToRender]
        newItems[index] = editItem
        await setScheduleItems(newItems)
        setEditingIndex(null)
        setEditItem(null)
    }

    const handleCancelClick = () => {
        setEditingIndex(null)
        setEditItem(null)
    }

    const handleItemChange = (field: string, value: string) => {
        if (!editItem) return;
        if (field === 'theme') {
            const theme = themeMap[value] || themeMap.stone;
            setEditItem({ ...editItem, color: theme.color, bg: theme.bg, border: theme.border })
        } else {
            setEditItem({ ...editItem, [field]: value })
        }
    }

    const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
        const newItems = [...itemsToRender]
        if (direction === 'up' && index > 0) {
            const temp = newItems[index - 1]
            newItems[index - 1] = newItems[index]
            newItems[index] = temp
            await setScheduleItems(newItems)
            setEditingIndex(index - 1)
        } else if (direction === 'down' && index < newItems.length - 1) {
            const temp = newItems[index + 1]
            newItems[index + 1] = newItems[index]
            newItems[index] = temp
            await setScheduleItems(newItems)
            setEditingIndex(index + 1)
        }
    }

    const handleDeleteItem = async (index: number) => {
        const newItems = [...itemsToRender]
        newItems.splice(index, 1)
        await setScheduleItems(newItems)
        setEditingIndex(null)
        setEditItem(null)
    }

    const handleAddItem = async () => {
        const theme = themeMap.stone;
        const newItem = {
            time: "New Time",
            title: "New Status",
            description: "Description",
            icon: "Clock",
            color: theme.color,
            bg: theme.bg,
            border: theme.border
        }
        const newItems = [...itemsToRender, newItem]
        await setScheduleItems(newItems)
        const newIndex = newItems.length - 1
        setEditingIndex(newIndex)
        setEditItem({ ...newItem })
    }

    // Determine the current theme key based on the saved classes
    const getThemeKey = (item: any) => {
        if (!item) return 'stone';
        for (const [key, value] of Object.entries(themeMap)) {
            if (value.color === item.color) return key;
        }
        return 'stone';
    }

    return (
        <Card className="bg-stone-900/50 backdrop-blur-md border-stone-800 shadow-2xl relative overflow-hidden group">
            <CardHeader className="border-b border-stone-800/50 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black text-stone-200 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        System Core Directives (Absolute Routine)
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {itemsToRender.map((item: any, index: number) => {
                        const isCurrentlyEditing = editingIndex === index;
                        const currentItemState = isCurrentlyEditing && editItem ? editItem : item;

                        if (isCurrentlyEditing) {
                            return (
                                <div key={index} className="flex flex-col gap-3 p-4 rounded-2xl bg-stone-950/80 border border-stone-700/80 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => handleMoveItem(index, 'up')} disabled={index === 0} className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800">
                                                <ArrowUp className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleMoveItem(index, 'down')} disabled={index === itemsToRender.length - 1} className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800">
                                                <ArrowDown className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleCancelClick} className="border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300">
                                                Cancel
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(index)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" onClick={() => handleSaveClick(index)} className="bg-orange-500 hover:bg-orange-600 text-white">
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-stone-400">Time / Period</label>
                                            <Input
                                                value={currentItemState.time}
                                                onChange={(e) => handleItemChange('time', e.target.value)}
                                                className="bg-stone-900 border-stone-700 text-stone-200 h-9"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-stone-400">Title</label>
                                            <Input
                                                value={currentItemState.title}
                                                onChange={(e) => handleItemChange('title', e.target.value)}
                                                className="bg-stone-900 border-stone-700 text-stone-200 h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-stone-400">Icon</label>
                                            <select
                                                value={currentItemState.icon}
                                                onChange={(e) => handleItemChange('icon', e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-stone-700 bg-stone-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-300 text-stone-200"
                                            >
                                                {Object.keys(iconMap).map(icon => (
                                                    <option key={icon} value={icon}>{icon}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-stone-400">Color Theme</label>
                                            <select
                                                value={getThemeKey(currentItemState)}
                                                onChange={(e) => handleItemChange('theme', e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-stone-700 bg-stone-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-300 text-stone-200 capitalize"
                                            >
                                                {Object.keys(themeMap).map(theme => (
                                                    <option key={theme} value={theme}>{theme}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 mt-2">
                                        <label className="text-xs font-medium text-stone-400">Description</label>
                                        <textarea
                                            value={currentItemState.description}
                                            onChange={(e) => handleItemChange('description', e.target.value)}
                                            className="flex min-h-[80px] w-full rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-300 text-stone-200 resize-y"
                                        />
                                    </div>
                                </div>
                            )
                        }

                        // Display Mode
                        const IconComponent = typeof item.icon === 'string' ? (iconMap[item.icon] || Zap) : (item.icon || Zap);
                        return (
                            <div
                                key={index}
                                onClick={() => handleItemClick(index)}
                                className={`flex gap-4 p-4 rounded-2xl bg-stone-950/50 border border-stone-800/50 transition-colors ${editingIndex === null ? 'cursor-pointer hover:bg-stone-900/80 hover:border-stone-700' : 'opacity-50 pointer-events-none grayscale'}`}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`p-3 rounded-xl ${item.bg} ${item.border} border`}>
                                        <IconComponent className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-stone-800 text-stone-300">
                                            {item.time}
                                        </span>
                                        <h3 className={`font-bold text-base md:text-lg ${item.color}`}>
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-stone-400 font-medium leading-relaxed whitespace-pre-line">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}

                    {editingIndex === null && (
                        <Button variant="outline" onClick={handleAddItem} className="w-full border-dashed border-stone-700 bg-transparent hover:bg-stone-800/50 text-stone-400 hover:text-stone-300 h-14 mt-4">
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Routine Action
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
