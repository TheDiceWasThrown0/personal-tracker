"use client"

import { useState, useEffect } from "react"
import { useSyncedState } from "@/hooks/useSyncedState"
import { NotebookPen, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type JournalEntries = Record<string, string>

const TODAY_PROMPTS = [
    "What went well today?",
    "What drained you?",
    "What are you grateful for?",
    "One thing to carry into tomorrow.",
]

export function QuickJournal() {
    const [isOpen, setIsOpen] = useState(false)
    const [entries, setEntries] = useSyncedState<JournalEntries>("quick_journal_v1", {})
    const [localContent, setLocalContent] = useState("")
    const [saved, setSaved] = useState(false)

    const dateKey = format(new Date(), "yyyy-MM-dd")
    const displayDate = format(new Date(), "EEEE, MMM do")

    // Load today's entry when opened
    useEffect(() => {
        if (isOpen) {
            setLocalContent(entries[dateKey] || "")
        }
    }, [isOpen, dateKey, entries])

    // Auto-save with debounce
    useEffect(() => {
        if (!isOpen) return
        const handler = setTimeout(() => {
            if (localContent !== (entries[dateKey] || "")) {
                setEntries(prev => ({ ...prev, [dateKey]: localContent }))
                setSaved(true)
                setTimeout(() => setSaved(false), 1500)
            }
        }, 600)
        return () => clearTimeout(handler)
    }, [localContent])

    const todayHasEntry = Boolean(entries[dateKey]?.trim())

    return (
        <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            {/* Slide-out Panel */}
            <div
                className={cn(
                    "bg-stone-900/95 backdrop-blur-xl border border-stone-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right pointer-events-auto",
                    isOpen ? "scale-100 opacity-100 w-80 md:w-[26rem]" : "scale-50 opacity-0 h-0 w-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-black/20">
                    <div>
                        <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2">
                            <NotebookPen className="w-4 h-4 text-orange-500" />
                            Daily Reflection
                        </h3>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">{displayDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {saved && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Saved
                            </span>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-stone-500 hover:text-stone-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Prompts */}
                <div className="px-4 pt-3 pb-1 flex flex-wrap gap-1.5">
                    {TODAY_PROMPTS.map((prompt) => (
                        <span
                            key={prompt}
                            className="text-[10px] text-stone-500 bg-stone-800/60 border border-stone-700 px-2 py-0.5 rounded-full font-mono"
                        >
                            {prompt}
                        </span>
                    ))}
                </div>

                {/* Textarea */}
                <div className="px-4 pb-4 pt-2">
                    <textarea
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        placeholder="Reflect on your day..."
                        className="w-full h-48 bg-stone-800/40 rounded-xl border border-stone-700 resize-none outline-none text-stone-200 placeholder:text-stone-600 text-sm leading-relaxed p-3 focus:border-orange-500/50 transition-colors"
                        autoFocus={isOpen}
                    />
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border pointer-events-auto relative",
                    isOpen
                        ? "bg-stone-800 border-stone-700 text-stone-400"
                        : "bg-orange-600 border-orange-500/50 text-white hover:bg-orange-500 hover:scale-105"
                )}
            >
                {isOpen ? <X className="w-5 h-5" /> : <NotebookPen className="w-5 h-5" />}
                {/* Dot indicator if today has an entry */}
                {!isOpen && todayHasEntry && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-950" />
                )}
            </button>
        </div>
    )
}
