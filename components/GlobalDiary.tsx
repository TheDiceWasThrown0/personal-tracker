"use client"

import { useState, useEffect } from "react"
import { useSyncedState } from "@/hooks/useSyncedState"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Book, ChevronLeft, ChevronRight, Save, Check } from "lucide-react"
import { format, addDays, subDays, isToday } from "date-fns"
import { cn } from "@/lib/utils"

type DiaryEntries = Record<string, string>

export function GlobalDiary() {
    const [entries, setEntries] = useSyncedState<DiaryEntries>("diary_entries_v1", {})
    const [isOpen, setIsOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [note, setNote] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const dateKey = format(currentDate, "yyyy-MM-dd")

    // Load note when date changes or entries sync
    useEffect(() => {
        setNote(entries[dateKey] || "")
    }, [dateKey, entries, isOpen])

    const handleSave = () => {
        setIsSaving(true)
        setEntries(prev => ({
            ...prev,
            [dateKey]: note
        }))
        setTimeout(() => setIsSaving(false), 500)
    }

    const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1))
    const handleNextDay = () => setCurrentDate(addDays(currentDate, 1))

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-stone-800 hover:bg-stone-700 text-orange-400 border-2 border-stone-600 z-50 transition-transform hover:scale-110"
                >
                    <Book className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] bg-stone-50 border-l border-stone-200 flex flex-col h-full">
                <SheetHeader className="pb-4 border-b border-stone-100">
                    <SheetTitle className="flex items-center justify-between text-stone-700">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <span className="font-mono text-lg font-bold min-w-[140px] text-center">
                                {format(currentDate, "MMM do, yyyy")}
                            </span>
                            <Button variant="ghost" size="icon" onClick={handleNextDay} disabled={isToday(currentDate) && false}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1">
                            <Book className="w-4 h-4" /> Captain's Log
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 py-6 flex flex-col gap-4">
                    <div className="flex-1 relative">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write your daily thoughts, ideas, or manifestos here..."
                            className="w-full h-full resize-none bg-white p-6 rounded-xl border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-serif text-lg leading-relaxed text-stone-700 custom-scrollbar"
                            spellCheck={false}
                        />
                        {isSaving && (
                            <div className="absolute top-4 right-4 text-xs font-bold text-emerald-500 bg-white/80 px-2 py-1 rounded-full border border-emerald-100 animate-pulse">
                                Saved
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSave}
                        className={cn(
                            "w-full font-bold transition-all",
                            isSaving ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-stone-800 hover:bg-stone-700 text-orange-100"
                        )}
                        disabled={note === (entries[dateKey] || "")}
                    >
                        {isSaving ? (
                            <>
                                <Check className="w-4 h-4 mr-2" /> Saved
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Save Entry
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
