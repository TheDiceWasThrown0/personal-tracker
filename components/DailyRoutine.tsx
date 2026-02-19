"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sun, Moon, BookOpen, Code2, Phone, Brain, Coffee, Plus, Trash2, X, Trophy, Dumbbell, Edit2 } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, any> = {
    Sun, Moon, BookOpen, Code2, Phone, Brain, Coffee, Check, Plus, Trash2, X, Trophy, Dumbbell
}

type DailyTask = {
    id: string
    text: string
    iconName: string
    color: string
}

const DEFAULT_MORNING: DailyTask[] = [
    { id: "read_ft", text: "Read Financial Times (15m)", iconName: "BookOpen", color: "text-rose-500" },
    { id: "check_indices", text: "Check Nikkei/S&P 500", iconName: "Sun", color: "text-amber-500" },
    { id: "ib_prep", text: "IB Mock Prep (6-8h)", iconName: "Brain", color: "text-blue-500" },
]

const DEFAULT_EVENING: DailyTask[] = [
    { id: "python", text: "Python / Data (1h)", iconName: "Code2", color: "text-emerald-500" },
    { id: "finance_study", text: "Finance Reading (30m)", iconName: "Coffee", color: "text-stone-500" },
    { id: "gym_time", text: "Going to the Gym", iconName: "Dumbbell", color: "text-blue-500" },
]

export function DailyRoutine() {
    // State - Synced
    const [completed, setCompleted] = useSyncedState<Record<string, boolean>>("daily_routine", {})
    // Using v4 keys to reset corrupted state from previous version and apply new defaults
    const [morningTasks, setMorningTasks] = useSyncedState<DailyTask[]>("morning_routine_tasks_v4", DEFAULT_MORNING)
    const [eveningTasks, setEveningTasks] = useSyncedState<DailyTask[]>("evening_routine_tasks_v4", DEFAULT_EVENING)
    const [streak, setStreak] = useSyncedState<number>("daily_streak", 0)
    const [lastCompletionDate, setLastCompletionDate] = useSyncedState<string | null>("last_completion_date", null)

    // Editing State
    const [isEditing, setIsEditing] = useState(false)
    const [tempMorning, setTempMorning] = useState(morningTasks)
    const [tempEvening, setTempEvening] = useState(eveningTasks)

    const [todayKey, setTodayKey] = useState("")

    useEffect(() => {
        // Initial set
        setTodayKey(new Date().toLocaleDateString('ja-JP')) // Use local time for Japan (User context)

        // Check for day rollover every minute
        const interval = setInterval(() => {
            const currentKey = new Date().toLocaleDateString('ja-JP')
            if (currentKey !== todayKey) {
                setTodayKey(currentKey)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [todayKey])

    useEffect(() => {
        // Simple Streak Logic: If all tasks done today, increment streak
        // This is a simplified check. Real streak logic is complex.
        // Let's just track if "Yesterday" was perfect.
        // For now, simpler: Count total "Perfect Days".
        // Ensure tasks exist to avoid empty streak increments
        if (morningTasks.length === 0 && eveningTasks.length === 0) return

        const allMorning = morningTasks.every(t => completed[`${todayKey}-${t.id}`])
        const allEvening = eveningTasks.every(t => completed[`${todayKey}-${t.id}`])

        if (allMorning && allEvening && lastCompletionDate !== todayKey && todayKey !== "") {
            setStreak(s => s + 1)
            setLastCompletionDate(todayKey)
        }
    }, [completed, todayKey, morningTasks, eveningTasks, lastCompletionDate, setStreak, setLastCompletionDate])

    const toggleTask = (taskId: string) => {
        if (isEditing) return
        const key = `${todayKey}-${taskId}`
        setCompleted(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const isCompleted = (taskId: string) => !!completed[`${todayKey}-${taskId}`]

    // Editing Handlers
    const startEditing = () => {
        setIsEditing(true)
        setTempMorning(morningTasks)
        setTempEvening(eveningTasks)
    }

    const saveEditing = () => {
        setMorningTasks(tempMorning)
        setEveningTasks(tempEvening)
        setIsEditing(false)
    }

    const cancelEditing = () => {
        setIsEditing(false)
    }

    const updateTaskText = (type: 'morning' | 'evening', index: number, text: string) => {
        if (type === 'morning') {
            const newTasks = [...tempMorning]
            newTasks[index] = { ...newTasks[index], text }
            setTempMorning(newTasks)
        } else {
            const newTasks = [...tempEvening]
            newTasks[index] = { ...newTasks[index], text }
            setTempEvening(newTasks)
        }
    }

    const removeTask = (type: 'morning' | 'evening', index: number) => {
        if (type === 'morning') {
            setTempMorning(tempMorning.filter((_, i) => i !== index))
        } else {
            setTempEvening(tempEvening.filter((_, i) => i !== index))
        }
    }

    const addTask = (type: 'morning' | 'evening') => {
        const newTask: DailyTask = { id: `task_${Date.now()}`, text: "New Habit", iconName: "Sun", color: "text-stone-400" }
        if (type === 'morning') {
            setTempMorning([...tempMorning, newTask])
        } else {
            setTempEvening([...tempEvening, newTask])
        }
    }

    // Helper to get Icon component
    const getIcon = (name: string) => ICON_MAP[name] || Sun

    return (
        <Card className={`border-stone-700 bg-stone-800/50 backdrop-blur-md shadow-xl relative overflow-hidden transition-all group ${!isEditing && 'hover:border-orange-500/30'}`}>
            <CardHeader className="pb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <CardTitle className="text-xl font-black text-stone-200 flex items-center gap-2">
                    <Sun className="w-6 h-6 text-orange-500" />
                    Daily Protocol
                </CardTitle>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-stone-900/50 px-2 py-1 rounded-full border border-stone-700">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500">{streak} Perfect Days</span>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-1">
                            <button onClick={saveEditing} className="p-1 bg-green-500 text-white rounded-full hover:scale-110"><Check className="w-4 h-4" /></button>
                            <button onClick={cancelEditing} className="p-1 bg-red-500 text-white rounded-full hover:scale-110"><X className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <button onClick={startEditing} className="bg-stone-800 text-stone-400 p-2 rounded-full border border-stone-700 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-orange-500 hover:border-orange-500/50">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
                {/* Morning Block */}
                <div className="bg-stone-900/40 rounded-3xl p-4 shadow-inner border border-stone-700/50">
                    <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <Sun className="w-3 h-3" /> Morning Operation
                    </h3>
                    <div className="space-y-2">
                        {(isEditing ? tempMorning : morningTasks).map((task, i) => {
                            const Icon = getIcon(task.iconName)
                            return (
                                <div key={task.id} className="relative group/item">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                value={task.text}
                                                onChange={(e) => updateTaskText('morning', i, e.target.value)}
                                                className="w-full bg-black/30 text-stone-200 p-2 rounded border border-stone-700 focus:border-orange-500 outline-none"
                                            />
                                            <button onClick={() => removeTask('morning', i)} className="text-red-400 hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all border text-left group",
                                                isCompleted(task.id)
                                                    ? "bg-orange-900/20 border-orange-500/30 shadow-inner"
                                                    : "bg-stone-800/50 border-stone-700 hover:border-orange-500/50 hover:bg-stone-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm border",
                                                isCompleted(task.id) ? "bg-orange-500 border-orange-400 text-stone-900" : `bg-stone-900 border-stone-700 text-stone-500 ${task.color ? task.color.replace('text-', 'group-hover:text-') : 'group-hover:text-orange-400'}`
                                            )}>
                                                {isCompleted(task.id) ? <Check className="w-4 h-4 font-bold" /> : <Icon className={cn("w-4 h-4", task.color)} />}
                                            </div>
                                            <span className={cn(
                                                "font-bold text-sm transition-colors",
                                                isCompleted(task.id) ? "text-orange-200 line-through decoration-orange-500/50" : "text-stone-400 group-hover:text-stone-200"
                                            )}>
                                                {task.text}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                        {isEditing && (
                            <button onClick={() => addTask('morning')} className="w-full py-2 border border-dashed border-stone-700 text-stone-400 text-xs font-bold rounded hover:bg-stone-800 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Habit</button>
                        )}
                    </div>
                </div>

                {/* Evening Block */}
                <div className="bg-stone-900/40 rounded-3xl p-4 shadow-inner border border-stone-700/50">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <Moon className="w-3 h-3" /> Night Shift
                    </h3>
                    <div className="space-y-2">
                        {(isEditing ? tempEvening : eveningTasks).map((task, i) => {
                            const Icon = getIcon(task.iconName)
                            return (
                                <div key={task.id} className="relative group/item">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                value={task.text}
                                                onChange={(e) => updateTaskText('evening', i, e.target.value)}
                                                className="w-full bg-black/30 text-stone-200 p-2 rounded border border-stone-700 focus:border-indigo-500 outline-none"
                                            />
                                            <button onClick={() => removeTask('evening', i)} className="text-red-400 hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all border text-left group",
                                                isCompleted(task.id)
                                                    ? "bg-indigo-900/20 border-indigo-500/30 shadow-inner"
                                                    : "bg-stone-800/50 border-stone-700 hover:border-indigo-500/50 hover:bg-stone-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm border",
                                                isCompleted(task.id) ? "bg-indigo-500 border-indigo-400 text-white" : `bg-stone-900 border-stone-700 text-stone-500 ${task.color ? task.color.replace('text-', 'group-hover:text-') : 'group-hover:text-indigo-400'}`
                                            )}>
                                                {isCompleted(task.id) ? <Check className="w-4 h-4 font-bold" /> : <Icon className={cn("w-4 h-4", task.color)} />}
                                            </div>
                                            <span className={cn(
                                                "font-bold text-sm transition-colors",
                                                isCompleted(task.id) ? "text-indigo-200 line-through decoration-indigo-500/50" : "text-stone-400 group-hover:text-stone-200"
                                            )}>
                                                {task.text}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                        {isEditing && (
                            <button onClick={() => addTask('evening')} className="w-full py-2 border border-dashed border-stone-700 text-stone-400 text-xs font-bold rounded hover:bg-stone-800 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Habit</button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
