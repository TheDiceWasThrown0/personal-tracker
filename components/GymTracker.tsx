"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Activity, Flame, Timer, Plus, Trash2, Save, RotateCcw, Edit2 } from "lucide-react"
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
        name: "Monday (Chest/Triceps)",
        color: "text-orange-500",
        exercises: [
            { id: "bench_press", name: "Bench Press", sets: 4, reps: "8-12", weight: "60kg" },
            { id: "incline_db", name: "Incline DB Press", sets: 3, reps: "10-12", weight: "24kg" },
            { id: "tricep_pushdown", name: "Tricep Pushdowns", sets: 3, reps: "12-15", weight: "20kg" },
        ]
    },
    {
        id: "tuesday",
        name: "Tuesday (Back/Biceps)",
        color: "text-blue-500",
        exercises: [
            { id: "pullups", name: "Pull Ups", sets: 3, reps: "AMRAP", weight: "BW" },
            { id: "rows", name: "Barbell Rows", sets: 4, reps: "8-10", weight: "60kg" },
            { id: "curls", name: "Bicep Curls", sets: 3, reps: "10-12", weight: "12kg" },
        ]
    },
    {
        id: "wednesday",
        name: "Wednesday (Active Recovery)",
        color: "text-emerald-500",
        exercises: [
            { id: "walk", name: "Light Walk & Stretch", sets: 1, reps: "30 mins", weight: "BW" },
        ]
    },
    {
        id: "thursday",
        name: "Thursday (Legs/Core)",
        color: "text-red-500",
        exercises: [
            { id: "squat", name: "Squat", sets: 4, reps: "6-8", weight: "80kg" },
            { id: "leg_press", name: "Leg Press", sets: 3, reps: "10-12", weight: "150kg" },
            { id: "plank", name: "Plank", sets: 3, reps: "1 min", weight: "BW" },
        ]
    },
    {
        id: "friday",
        name: "Friday (Shoulders/Arms)",
        color: "text-purple-500",
        exercises: [
            { id: "overhead_press", name: "Overhead Press", sets: 3, reps: "10-12", weight: "40kg" },
            { id: "lat_raise", name: "Lateral Raises", sets: 4, reps: "15-20", weight: "10kg" },
            { id: "hammer_curls", name: "Hammer Curls", sets: 3, reps: "10-12", weight: "14kg" },
        ]
    },
    {
        id: "saturday",
        name: "Saturday (Full Body)",
        color: "text-yellow-500",
        exercises: [
            { id: "deadlift", name: "Deadlift", sets: 3, reps: "5", weight: "100kg" },
            { id: "dips", name: "Dips", sets: 3, reps: "8-12", weight: "BW" },
        ]
    },
    {
        id: "sunday",
        name: "Sunday (Rest)",
        color: "text-stone-500",
        exercises: [
            { id: "rest", name: "Rest & Prep for Week", sets: 1, reps: "All Day", weight: "0kg" },
        ]
    }
]

export default function GymTracker() {
    // Persistence - Synced
    const [splits, setSplits] = useSyncedState<WorkoutSplit[]>("workout_splits", DEFAULT_SPLITS)
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
                        <button onClick={startEditing} className="bg-stone-800 text-stone-400 p-2 rounded-full border border-stone-700 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-rose-500 hover:border-rose-500/50">
                            <Edit2 className="w-4 h-4" />
                        </button>
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
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-black uppercase text-sm ${split.color} flex items-center gap-2`}>
                                        <SplitIcon className="w-4 h-4" />
                                        {split.name}
                                    </h3>
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
