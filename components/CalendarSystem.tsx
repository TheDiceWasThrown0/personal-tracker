"use client"

import { useState } from "react"
import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, Calendar as CalendarIcon, X } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from "date-fns"
import { cn } from "@/lib/utils"

type TodoItem = {
    id: string
    text: string
    completed: boolean
}

type CalendarEvents = Record<string, TodoItem[]>

export function CalendarSystem() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [events, setEvents] = useSyncedState<CalendarEvents>("calendar_events_v1", {})
    const [newTodo, setNewTodo] = useState("")

    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    const days = eachDayOfInterval({ start, end })

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
    const currentTodos = selectedDate ? (events[dateKey] || []) : []

    const addTodo = () => {
        if (!newTodo.trim() || !selectedDate) return
        const todo: TodoItem = {
            id: Math.random().toString(36).substr(2, 9),
            text: newTodo,
            completed: false
        }
        const updatedEvents = { ...events }
        if (!updatedEvents[dateKey]) updatedEvents[dateKey] = []
        updatedEvents[dateKey] = [...updatedEvents[dateKey], todo]
        setEvents(updatedEvents)
        setNewTodo("")
    }

    const toggleTodo = (todoId: string) => {
        if (!selectedDate) return
        const updatedEvents = { ...events }
        updatedEvents[dateKey] = updatedEvents[dateKey].map(t =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
        )
        setEvents(updatedEvents)
    }

    const deleteTodo = (todoId: string) => {
        if (!selectedDate) return
        const updatedEvents = { ...events }
        updatedEvents[dateKey] = updatedEvents[dateKey].filter(t => t.id !== todoId)
        setEvents(updatedEvents)
    }

    return (
        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
            {/* Calendar View */}
            <Card className="md:col-span-2 bg-stone-900/80 backdrop-blur border-stone-800 shadow-xl overflow-hidden flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-stone-900/90 border-b border-stone-800">
                    <CardTitle className="text-xl font-black text-stone-200 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-orange-500" />
                        {format(currentMonth, "MMMM yyyy")}
                    </CardTitle>
                    <div className="flex gap-1 text-stone-400">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="hover:text-stone-200 hover:bg-stone-800"><ChevronLeft className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="hover:text-stone-200 hover:bg-stone-800"><ChevronRight className="w-5 h-5" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-stone-500 uppercase tracking-widest">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 flex-1 gap-1">
                        {days.map((day, i) => {
                            const dKey = format(day, "yyyy-MM-dd")
                            const dayEvents = events[dKey] || []
                            const hasEvents = dayEvents.length > 0
                            const isSelected = selectedDate && isSameDay(day, selectedDate)

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "relative flex font-bold flex-col items-center justify-center rounded-xl transition-all hover:bg-stone-800",
                                        !isSameMonth(day, currentMonth) && "text-stone-700 bg-stone-900/30",
                                        isSameMonth(day, currentMonth) && "text-stone-400 bg-stone-900 border border-stone-800",
                                        isToday(day) && "bg-orange-900/20 text-orange-500 border-orange-900/50",
                                        isSelected && "ring-2 ring-orange-500 bg-stone-800 z-10 scale-105 shadow-lg text-stone-200",
                                        "min-h-[60px]"
                                    )}
                                >
                                    <span className="text-sm">{format(day, "d")}</span>
                                    {hasEvents && (
                                        <div className="flex gap-0.5 mt-1">
                                            {dayEvents.slice(0, 3).map((_, idx) => (
                                                <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", dayEvents[idx].completed ? "bg-emerald-500" : "bg-orange-500")} />
                                            ))}
                                            {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-stone-600" />}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Todo List for Selected Date */}
            <Card className="bg-stone-900/80 backdrop-blur border-stone-800 shadow-xl flex flex-col relative overflow-hidden">
                {selectedDate ? (
                    <>
                        <CardHeader className="pb-2 border-b border-stone-800 bg-stone-900/50">
                            <CardTitle className="text-lg font-bold text-stone-300 flex justify-between items-center">
                                <span>{format(selectedDate, "EEEE, MMM do")}</span>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="h-6 w-6 text-stone-500 hover:text-stone-300 hover:bg-stone-800"><X className="w-4 h-4" /></Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                            <div className="flex gap-2">
                                <input
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                                    placeholder="Add task..."
                                    className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-stone-600"
                                />
                                <Button onClick={addTodo} size="icon" className="bg-orange-600 hover:bg-orange-500 text-white"><Plus className="w-4 h-4" /></Button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {currentTodos.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-stone-600 text-sm italic">
                                        <p>No plans yet.</p>
                                    </div>
                                ) : (
                                    currentTodos.map(todo => (
                                        <div key={todo.id} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-all">
                                            <button
                                                onClick={() => toggleTodo(todo.id)}
                                                className={cn(
                                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                    todo.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-stone-600 text-transparent hover:border-orange-500"
                                                )}
                                            >
                                                <Check className="w-3 h-3 font-bold" />
                                            </button>
                                            <span className={cn("flex-1 text-sm font-medium", todo.completed ? "text-stone-500 line-through decoration-stone-600" : "text-stone-300")}>
                                                {todo.text}
                                            </span>
                                            <button onClick={() => deleteTodo(todo.id)} className="text-stone-600 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-600 p-8 text-center">
                        <CalendarIcon className="w-16 h-16 mb-4 text-stone-800" />
                        <h3 className="text-lg font-bold text-stone-500">Select a Date</h3>
                        <p className="text-sm">Click on any day in the calendar to view and manage your tasks.</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
