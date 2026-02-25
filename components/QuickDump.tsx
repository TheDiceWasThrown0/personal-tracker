"use client"

import { useState } from "react"
import { useSyncedState } from "@/hooks/useSyncedState"
import { PencilLine, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickDump() {
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useSyncedState("quick_dump_text", "")

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Slide-out Panel */}
            <div
                className={cn(
                    "bg-stone-900/90 backdrop-blur-xl border border-stone-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right",
                    isOpen ? "scale-100 opacity-100 h-80 w-72 md:w-96" : "scale-50 opacity-0 h-0 w-0 pointer-events-none"
                )}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-black/20">
                    <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2">
                        <PencilLine className="w-4 h-4 text-orange-500" />
                        Quick Dump
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-stone-500 hover:text-stone-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 h-[calc(100%-3rem)]">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Drop raw thoughts here..."
                        className="w-full h-full bg-transparent resize-none outline-none text-stone-300 placeholder:text-stone-600 text-sm leading-relaxed"
                        autoFocus={isOpen}
                    />
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border",
                    isOpen
                        ? "bg-stone-800 border-stone-700 text-stone-400 rotate-90"
                        : "bg-orange-600 border-orange-500/50 text-white hover:bg-orange-500 hover:scale-105"
                )}
            >
                {isOpen ? <X className="w-5 h-5" /> : <PencilLine className="w-5 h-5" />}
            </button>
        </div>
    )
}
