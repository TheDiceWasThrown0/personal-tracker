"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { CheckCircle2, Circle, Trophy, Edit2, Plus, Trash2, X, Check, Save } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Phase = {
    id: number
    title: string
    date: string
    status: "active" | "upcoming" | "completed"
    goals: string[]
    color: string
    shadow: string
    border: string
}

const initialPhases: Phase[] = [
    {
        id: 0,
        title: "Phase 1: Foundation & Pre-Uni",
        date: "Feb 2026 - Sep 2026",
        status: "active",
        goals: [
            "Python (Current: Feb)",
            "Pass IB Mocks (Feb)",
            "Excel Basics (Mar-Sep)",
            "Read 'Financial Markets' (Mar-Sep)",
            "Daily Giorgia Call"
        ],
        color: "bg-orange-900/80 border-orange-500/50 text-orange-100",
        shadow: "shadow-orange-900",
        border: "border-orange-500/30"
    },
    {
        id: 1,
        title: "Phase 2: University Years (Skill Stack)",
        date: "Sep 2026 - Jun 2030",
        status: "upcoming",
        goals: [
            "Year 1: Statistics, Excel Adv, SQL",
            "Year 2: R, Linear Algebra, Derivatives",
            "Year 3: ML, Bloomberg, GMAT Prep",
            "Year 4: CFA L1, Econometrics, GMAT 790+",
            "GPA 3.85+ (Non-negotiable)"
        ],
        color: "bg-amber-900/80 border-amber-500/50 text-amber-100",
        shadow: "shadow-amber-900",
        border: "border-amber-500/30"
    },
    {
        id: 2,
        title: "Phase 3: Work Experience",
        date: "Jun 2030 - Aug 2031",
        status: "upcoming",
        goals: ["Junior Trader (Nomura/GS)", "Save ¥6-8M for Tuition", "Learn Risk Mgmt", "Visit Giorgia 3x"],
        color: "bg-stone-800 border-stone-500/50 text-stone-200",
        shadow: "shadow-stone-900",
        border: "border-stone-600"
    },
    {
        id: 3,
        title: "Phase 4: Bocconi MSc Finance",
        date: "Sep 2031 - Jun 2033",
        status: "upcoming",
        goals: ["Integrate Skills & Practice", "Move to Milan (Close to Giorgia)", "Goldman Sachs Summer Analyst", "Top 5% Class Rank"],
        color: "bg-red-900/80 border-red-500/50 text-red-100",
        shadow: "shadow-red-900",
        border: "border-red-500/30"
    },
    {
        id: 4,
        title: "Phase 5: Goldman Sachs",
        date: "Jul 2033 - Dec 2036",
        status: "upcoming",
        goals: ["Quantitative Trader", "Save €500k-800k", "Build Track Record", "Prepare Fund Launch"],
        color: "bg-sky-900/80 border-sky-500/50 text-sky-100",
        shadow: "shadow-sky-900",
        border: "border-sky-500/30"
    },
    {
        id: 5,
        title: "Phase 6: The Hedge Fund",
        date: "2037 - 2040",
        status: "upcoming",
        goals: ["Launch with €15-20M AUM", "Target 15-20% Returns", "Scale to €500M+ AUM", "Net Worth > ¥1B"],
        color: "bg-emerald-900/80 border-emerald-500/50 text-emerald-100",
        shadow: "shadow-emerald-900",
        border: "border-emerald-500/30"
    },
    {
        id: 6,
        title: "Phase 7: Azabudai Hills",
        date: "2041",
        status: "upcoming",
        goals: ["Net Worth ¥5B+", "Buy Azabudai Residence", "Marry Giorgia", "Win Life"],
        color: "bg-purple-900/80 border-purple-500/50 text-purple-100",
        shadow: "shadow-purple-900",
        border: "border-purple-500/30"
    },
]

export function RoadmapTimeline() {
    // Synced Phases
    const [phases, setPhases] = useSyncedState<Phase[]>("roadmap_phases_v2", initialPhases)
    const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null)

    // Temp state for the phase being edited
    const [tempPhase, setTempPhase] = useState<Phase | null>(null)

    const handleEditClick = (phase: Phase) => {
        setEditingPhaseId(phase.id)
        setTempPhase({ ...phase })
    }

    const handleSave = () => {
        if (!tempPhase) return
        setPhases(currentState => currentState.map(p => p.id === tempPhase.id ? tempPhase : p))
        setEditingPhaseId(null)
        setTempPhase(null)
    }

    const handleCancel = () => {
        setEditingPhaseId(null)
        setTempPhase(null)
    }

    const handleGoalChange = (index: number, value: string) => {
        if (!tempPhase) return
        const newGoals = [...tempPhase.goals]
        newGoals[index] = value
        setTempPhase({ ...tempPhase, goals: newGoals })
    }

    const addGoal = () => {
        if (!tempPhase) return
        setTempPhase({ ...tempPhase, goals: [...tempPhase.goals, "New Goal"] })
    }

    const removeGoal = (index: number) => {
        if (!tempPhase) return
        const newGoals = tempPhase.goals.filter((_, i) => i !== index)
        setTempPhase({ ...tempPhase, goals: newGoals })
    }

    // Helper to update temp phase field
    const updateField = (field: keyof Phase, value: any) => {
        if (!tempPhase) return
        setTempPhase({ ...tempPhase, [field]: value })
    }

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[4px] before:bg-white before:rounded-full">
            {phases.map((phase, index) => {
                const isEditing = editingPhaseId === phase.id
                const displayPhase = isEditing && tempPhase ? tempPhase : phase

                return (
                    <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        {/* Icon */}
                        <div
                            className={`absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-white ${displayPhase.color} shadow-lg md:left-1/2 md:-translate-x-1/2 flex items-center justify-center transition-transform z-10 cursor-pointer`}
                            onClick={() => {
                                // Cycle status on click if not editing
                                if (!isEditing) {
                                    const nextStatus = phase.status === 'upcoming' ? 'active' : phase.status === 'active' ? 'completed' : 'upcoming'
                                    const updated = phases.map(p => p.id === phase.id ? { ...p, status: nextStatus as any } : p)
                                    setPhases(updated)
                                }
                            }}
                        >
                            {displayPhase.status === "completed" ? (
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : displayPhase.status === "active" ? (
                                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                            ) : (
                                <Circle className="w-6 h-6 text-white/50" />
                            )}
                        </div>

                        {/* Card */}
                        <div className={`ml-16 md:ml-0 md:w-[45%] p-6 bg-white border-2 ${displayPhase.border} rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] transition-all relative`}>

                            {!isEditing && (
                                <button
                                    onClick={() => handleEditClick(phase)}
                                    className="absolute top-4 right-4 text-stone-300 hover:text-stone-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}

                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        className="w-full font-black text-lg text-gray-700 border-b-2 border-gray-200 focus:border-primary focus:outline-none bg-transparent"
                                        value={displayPhase.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                    />
                                    <input
                                        className="w-full text-sm font-bold text-gray-400 uppercase tracking-widest border-b-2 border-gray-200 focus:border-primary focus:outline-none bg-transparent"
                                        value={displayPhase.date}
                                        onChange={(e) => updateField('date', e.target.value)}
                                    />
                                    <div className="space-y-2">
                                        {displayPhase.goals.map((goal, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    className="flex-1 text-sm text-gray-600 bg-gray-50 rounded px-2 py-1 border border-gray-200"
                                                    value={goal}
                                                    onChange={(e) => handleGoalChange(i, e.target.value)}
                                                />
                                                <button onClick={() => removeGoal(i)} className="text-red-400 hover:text-red-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={addGoal} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                            <Plus className="w-3 h-3" /> Add Goal
                                        </button>
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <button onClick={handleCancel} className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold">Cancel</button>
                                        <button onClick={handleSave} className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-black text-gray-700 tracking-tight">{phase.title}</h3>
                                    <time className="block mb-3 text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 w-fit px-2 py-1 rounded-lg mt-1">
                                        {phase.date}
                                    </time>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 font-medium">
                                        {phase.goals.map((goal, i) => (
                                            <li key={i}>{goal}</li>
                                        ))}
                                    </ul>
                                    {phase.id === 6 && <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-sm mt-4 inline-block" />}
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
