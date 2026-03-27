"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Activity, Flame, Timer, Plus, Trash2, Save, RotateCcw, Edit2, Printer } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

type Exercise = {
    id: string
    name: string
    sets: number
    reps: string
    weight: string
}

type WorkoutSplit = {
    id: string
    name: string
    color: string
    exercises: Exercise[]
}

const SPLIT_ICONS: Record<string, any> = {
    monday: Flame,
    tuesday: Dumbbell,
    wednesday: Timer,
    thursday: Activity,
    friday: Flame,
    saturday: Dumbbell,
    sunday: Timer
}

const DEFAULT_SPLITS: WorkoutSplit[] = [
    {
        id: "monday",
        name: "Monday (Lower & Core - 土台と推進力の階)",
        color: "text-green-500",
        exercises: [
            { id: "incline_walk_am", name: "〔AM〕Incline Walk", sets: 1, reps: "20min", weight: "18% 3.5km/h" },
            { id: "squat", name: "Barbell Squat / Hack Squat", sets: 3, reps: "8", weight: "" },
            { id: "back_ext", name: "45° Back Extension / Bulgarian Squat", sets: 3, reps: "10-12", weight: "" },
            { id: "leg_ext", name: "Leg Extension", sets: 3, reps: "12", weight: "63kg" },
            { id: "leg_curl", name: "Seated Leg Curl", sets: 3, reps: "12", weight: "36kg" },
            { id: "crunch", name: "Abdominal Crunch (Matrix)", sets: 3, reps: "12", weight: "90kg" },
        ]
    },
    {
        id: "tuesday",
        name: "Tuesday (Push - 装甲とメロン肩の階)",
        color: "text-orange-500",
        exercises: [
            { id: "incline_walk_am", name: "〔AM〕Incline Walk", sets: 1, reps: "20min", weight: "18% 3.5km/h" },
            { id: "bench", name: "Bench Press", sets: 3, reps: "8", weight: "70kg" },
            { id: "incline_db", name: "Incline DB Press", sets: 3, reps: "10", weight: "24~26kg" },
            { id: "pec_fly", name: "Pec Fly", sets: 3, reps: "10", weight: "80kg" },
            { id: "lat_raise", name: "Lateral Raise (Drop Set)", sets: 3, reps: "Failure", weight: "7kg, 4kg, 0kg" },
            { id: "rope_push", name: "Rope Pushdown", sets: 3, reps: "12", weight: "24.9kg" },
        ]
    },
    {
        id: "wednesday",
        name: "Wednesday (Rest - 冷却の階)",
        color: "text-stone-500",
        exercises: [
            { id: "rest", name: "Rest & Recover", sets: 1, reps: "All Day", weight: "" },
        ]
    },
    {
        id: "thursday",
        name: "Thursday (Pull - 厚みと広がりの階)",
        color: "text-blue-500",
        exercises: [
            { id: "incline_walk_am", name: "〔AM〕Incline Walk", sets: 1, reps: "20min", weight: "18% 3.5km/h" },
            { id: "lat_wide", name: "Lat Pulldown (back wide)", sets: 3, reps: "10", weight: "59kg" },
            { id: "seated_row", name: "Seated Row (Thickness)", sets: 3, reps: "10", weight: "24kg" },
            { id: "machine_row", name: "Machine Row / T-Bar Row", sets: 3, reps: "10", weight: "" },
            { id: "rear_delt", name: "Rear Delt", sets: 3, reps: "15", weight: "47.5kg" },
            { id: "db_curl", name: "Seated Dumbbell Curl", sets: 3, reps: "10-12", weight: "12kg" },
        ]
    },
    {
        id: "friday",
        name: "Friday (Weak Point - 補完の階)",
        color: "text-yellow-500",
        exercises: [
            { id: "weak_point", name: "Weak Point Training / Rest (Flexible)", sets: 1, reps: "—", weight: "" },
        ]
    },
    {
        id: "saturday",
        name: "Saturday (Athlete Conditioning - 爆発の階)",
        color: "text-purple-500",
        exercises: [
            { id: "hiit", name: "MATRIX Cycle (HIIT)", sets: 9, reps: "20s on / 40s off", weight: "8~10 sets" },
        ]
    },
    {
        id: "sunday",
        name: "Sunday (System Prep - 抽出と整理の階)",
        color: "text-stone-500",
        exercises: [
            { id: "rest_prep_meal", name: "Rest & Meal Prep", sets: 1, reps: "All Day", weight: "" },
        ]
    }
]

export default function GymTracker() {
    // Persistence - Synced
    const [splits, setSplits] = useSyncedState<WorkoutSplit[]>("workout_splits_v2", DEFAULT_SPLITS)
    const [lastWorkout, setLastWorkout] = useSyncedState<string>("last_workout_date", "")
    const [streak, setStreak] = useSyncedState<number>("workout_streak", 0)

    // Editing State
    const [isEditing, setIsEditing] = useState(false)
    const [tempSplits, setTempSplits] = useState(splits)
    const [activeTab, setActiveTab] = useState("monday")

    // Update temp state when real state changes (if not editing)
    useEffect(() => {
        if (!isEditing) setTempSplits(splits)
    }, [splits, isEditing])

    // Handlers
    const startEditing = () => {
        setIsEditing(true)
        setTempSplits(splits)
    }

    const resetToDefault = () => {
        if (confirm("Are you sure you want to reset your splits to the default program? This will overwrite your current routine.")) {
            setSplits(DEFAULT_SPLITS)
            setTempSplits(DEFAULT_SPLITS)
            setIsEditing(false)
        }
    }

    const saveEditing = () => {
        setSplits(tempSplits)
        setIsEditing(false)
    }

    const cancelEditing = () => {
        setIsEditing(false)
    }

    const updateExercise = (splitIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
        const newSplits = [...tempSplits]
        newSplits[splitIndex].exercises[exerciseIndex] = {
            ...newSplits[splitIndex].exercises[exerciseIndex],
            [field]: value
        }
        setTempSplits(newSplits)
    }

    const logWorkout = (splitId: string) => {
        // Simple logging logic: Update "last workout" and increment streak if it's a new day
        const today = new Date().toLocaleDateString('ja-JP')
        if (lastWorkout !== today) {
            setStreak(s => s + 1)
            setLastWorkout(today)
            alert(`Great ${splitId} workout! Streak: ${streak + 1} 🔥`)
        } else {
            alert("Workout already logged for today! Keep grinding 💪")
        }
    }

    const printWorkout = () => {
        const win = window.open('', '_blank')
        if (!win) return
        const rows = splits.map(split => `
            <div class="day">
                <h2>${split.name}</h2>
                <table>
                    <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr></thead>
                    <tbody>
                        ${split.exercises.map(ex => `
                            <tr${ex.id === 'incline_walk_am' ? ' class="am"' : ''}>
                                <td>${ex.name}</td>
                                <td>${ex.sets}</td>
                                <td>${ex.reps}</td>
                                <td>${ex.weight || '—'}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`).join('')
        win.document.write(`<!DOCTYPE html><html><head><title>Bio-Infrastructure v2.0 — Workout Split</title><style>
            body { font-family: 'Helvetica Neue', sans-serif; color: #1a1a1a; padding: 32px; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 22px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 3px solid #e11d48; padding-bottom: 8px; margin-bottom: 8px; }
            .version { font-size: 11px; color: #888; margin-bottom: 20px; }
            .os-rules { background: #fafafa; border-left: 3px solid #e11d48; padding: 10px 14px; margin-bottom: 28px; font-size: 11px; line-height: 1.7; }
            .os-rules strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #e11d48; margin-bottom: 4px; }
            .day { margin-bottom: 28px; break-inside: avoid; }
            h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #e11d48; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; text-transform: uppercase; font-size: 10px; color: #888; border-bottom: 1px solid #ddd; padding: 4px 6px; }
            td { padding: 6px 6px; border-bottom: 1px solid #f0f0f0; }
            td:first-child { font-weight: 600; }
            td:not(:first-child) { text-align: center; color: #555; }
            tr.am td { color: #0284c7; }
            tr.am td:first-child { font-style: italic; }
            .footer { margin-top: 32px; font-size: 10px; color: #aaa; text-align: right; }
            @media print { body { padding: 16px; } }
        </style></head><body>
            <h1>🧬 Bio-Infrastructure — Workout Split</h1>
            <div class="version">v2.0 &nbsp;|&nbsp; Lower / Push / Pull / Athlete</div>
            <div class="os-rules">
                <strong>全体OS — Morning Phase</strong>
                起床後、水・少量の塩・プロテイン半スクープ（またはEAA 10g）のみ摂取し、即座にIncline Walkを実行。カタボリックを防ぎつつ純粋な脂肪だけを燃やす。
                <br/><br/>
                <strong>全体OS — Night Phase</strong>
                朝のCardioから最低6時間以上空け、十分な糖質とタンパク質を補給した状態でウェイトに挑む。終了後のCardioは一切行わず、速やかに帰宅して栄養を摂取し、システムをシャットダウン（睡眠）させる。
            </div>
            ${rows}
            <div class="footer">Printed ${new Date().toLocaleDateString()}</div>
        </body></html>`)
        win.document.close()
        win.focus()
        win.print()
    }

    const addExercise = (splitIndex: number) => {
        const newSplits = [...tempSplits]
        newSplits[splitIndex].exercises.push({
            id: `ex_${Date.now()}`,
            name: "New Exercise",
            sets: 3,
            reps: "10",
            weight: "0kg"
        })
        setTempSplits(newSplits)
    }

    const removeExercise = (splitIndex: number, exerciseIndex: number) => {
        const newSplits = [...tempSplits]
        newSplits[splitIndex].exercises = newSplits[splitIndex].exercises.filter((_, i) => i !== exerciseIndex)
        setTempSplits(newSplits)
    }

    const updateSplitName = (splitIndex: number, value: string) => {
        const newSplits = [...tempSplits]
        newSplits[splitIndex] = { ...newSplits[splitIndex], name: value }
        setTempSplits(newSplits)
    }

    return (
        <Card className={`border-stone-700 bg-stone-800/50 backdrop-blur-md shadow-xl relative overflow-hidden transition-all group ${!isEditing && 'hover:border-rose-500/30'}`}>
            <CardHeader className="pb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <CardTitle className="text-xl font-black text-stone-200 flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-rose-500" />
                    Bio-Infrastructure
                </CardTitle>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-stone-900/50 px-2 py-1 rounded-full border border-stone-700">
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span className="text-xs font-bold text-rose-500">{streak} Day Streak</span>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-1">
                            <button onClick={saveEditing} className="p-1 bg-green-500 text-white rounded-full hover:scale-110"><Save className="w-4 h-4" /></button>
                            <button onClick={cancelEditing} className="p-1 bg-red-500 text-white rounded-full hover:scale-110"><RotateCcw className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            <button onClick={resetToDefault} className="text-[10px] uppercase font-bold text-stone-500 hover:text-stone-300 mr-2 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Reset
                            </button>
                            <button onClick={printWorkout} title="Print as PDF" className="bg-stone-800 text-stone-400 p-2 rounded-full border border-stone-700 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-rose-500 hover:border-rose-500/50">
                                <Printer className="w-4 h-4" />
                            </button>
                            <button onClick={startEditing} className="bg-stone-800 text-stone-400 p-2 rounded-full border border-stone-700 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-rose-500 hover:border-rose-500/50">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs defaultValue="push" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-7 bg-stone-900/50 p-1 rounded-xl">
                        {DEFAULT_SPLITS.map(split => (
                            <TabsTrigger
                                key={split.id}
                                value={split.id}
                                className="text-[10px] md:text-xs font-bold uppercase data-[state=active]:bg-stone-700 data-[state=active]:text-rose-400"
                            >
                                {split.id.substring(0, 3)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {(isEditing ? tempSplits : splits).map((split, splitIndex) => {
                        const SplitIcon = SPLIT_ICONS[split.id] || Dumbbell
                        return (
                            <TabsContent key={split.id} value={split.id} className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between flex-1 gap-2">
                                    <div className={`font-black text-sm ${split.color} flex items-center gap-2 flex-1`}>
                                        <SplitIcon className="w-4 h-4 shrink-0" />
                                        {isEditing ? (
                                            <input
                                                value={split.name}
                                                onChange={(e) => updateSplitName(splitIndex, e.target.value)}
                                                className="w-full bg-stone-900 text-stone-200 text-sm font-bold rounded px-2 py-1 border border-stone-600 focus:border-rose-500 outline-none"
                                            />
                                        ) : (
                                            <span className="uppercase">{split.name}</span>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => logWorkout(split.name)}
                                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg hover:shadow-rose-900/20 transition-all flex items-center gap-1"
                                        >
                                            <Activity className="w-3 h-3" /> Log Session
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <div className="grid grid-cols-12 text-[10px] text-stone-500 uppercase font-bold px-2">
                                        <div className="col-span-6 md:col-span-5">Exercise</div>
                                        <div className="col-span-2 text-center">Sets</div>
                                        <div className="col-span-2 text-center">Reps</div>
                                        <div className="col-span-2 text-center">Weight</div>
                                    </div>
                                    {split.exercises.map((exercise, exIndex) => (
                                        <div key={exercise.id} className="grid grid-cols-12 gap-2 items-center bg-stone-900/40 p-3 rounded-lg border border-stone-800 hover:border-stone-700 transition-colors">
                                            <div className="col-span-6 md:col-span-5">
                                                {isEditing ? (
                                                    <input
                                                        value={exercise.name}
                                                        onChange={(e) => updateExercise(splitIndex, exIndex, 'name', e.target.value)}
                                                        className="w-full bg-black/30 text-stone-200 text-sm font-bold rounded px-2 py-1 border border-stone-700 focus:border-rose-500 outline-none"
                                                    />
                                                ) : (
                                                    <span className="text-stone-200 font-bold text-sm truncate block">{exercise.name}</span>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={exercise.sets}
                                                        onChange={(e) => updateExercise(splitIndex, exIndex, 'sets', Number(e.target.value))}
                                                        className="w-full bg-black/30 text-stone-400 text-xs text-center rounded px-1 py-1 border border-stone-700"
                                                    />
                                                ) : (
                                                    <span className="text-stone-500 text-xs font-mono">{exercise.sets}</span>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-center">
                                                {isEditing ? (
                                                    <input
                                                        value={exercise.reps}
                                                        onChange={(e) => updateExercise(splitIndex, exIndex, 'reps', e.target.value)}
                                                        className="w-full bg-black/30 text-stone-400 text-xs text-center rounded px-1 py-1 border border-stone-700"
                                                    />
                                                ) : (
                                                    <span className="text-stone-400 text-xs font-mono">{exercise.reps}</span>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-center">
                                                {isEditing ? (
                                                    <input
                                                        value={exercise.weight}
                                                        onChange={(e) => updateExercise(splitIndex, exIndex, 'weight', e.target.value)}
                                                        className="w-full bg-black/30 text-rose-300 text-xs font-bold text-center rounded px-1 py-1 border border-stone-700"
                                                    />
                                                ) : (
                                                    <span className="text-rose-400/80 text-xs font-bold">{exercise.weight}</span>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <div className="col-span-12 md:col-span-1 flex justify-end">
                                                    <button onClick={() => removeExercise(splitIndex, exIndex)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <button onClick={() => addExercise(splitIndex)} className="w-full py-3 border border-dashed border-stone-700 text-stone-500 text-xs font-bold rounded-xl hover:bg-stone-800 hover:text-rose-400 flex items-center justify-center gap-1 transition-all">
                                            <Plus className="w-4 h-4" /> Add Exercise
                                        </button>
                                    )}
                                </div>
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </CardContent>
        </Card>
    )
}
