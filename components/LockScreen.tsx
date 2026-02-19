"use client"

import { useState, useEffect } from "react"
import { Lock, ArrowRight, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
    const [passcode, setPasscode] = useState("")
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)

    // The Secret Code (Billionaire Year or Graduation Year)
    const CORRECT_CODE = "241109" // Anniversary Code

    const handleUnlock = async () => {
        if (passcode === CORRECT_CODE) {
            // Notify system
            try {
                await fetch('/api/auth-log', {
                    method: 'POST',
                    body: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent
                    })
                })
            } catch (e) {
                console.error("Logging failed", e)
            }

            onUnlock()
        } else {
            setError(true)
            setShake(true)
            setTimeout(() => setShake(false), 500)
            setPasscode("")
            setTimeout(() => setError(false), 2000)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleUnlock()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1410] text-stone-200">
            <div className={cn("max-w-md w-full p-8 mx-4 space-y-8 text-center transition-all duration-300", shake ? "translate-x-[-10px]" : "")}>

                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-stone-900 border-2 border-stone-800 shadow-[0_0_30px_rgba(230,106,51,0.1)]">
                        <Lock className="w-10 h-10 text-orange-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter text-stone-100">
                        SHIJUN'S ROOM
                    </h1>
                    <p className="text-stone-500 font-medium">restricted access. authorized personnel only.</p>
                </div>

                <div className="space-y-4 pt-4 relative">
                    <div className="relative">
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => {
                                setPasscode(e.target.value)
                                if (error) setError(false)
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter Access Code"
                            className={cn(
                                "w-full bg-stone-900/50 border-2 text-center text-2xl font-mono tracking-[0.5em] py-4 rounded-xl focus:outline-none transition-all placeholder:text-stone-700 placeholder:tracking-normal placeholder:font-sans",
                                error ? "border-red-500/50 text-red-200" : "border-stone-800 text-stone-200 focus:border-orange-500/50 focus:shadow-[0_0_20px_rgba(230,106,51,0.1)]"
                            )}
                            autoFocus
                        />
                        <button
                            onClick={handleUnlock}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-2 text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" />
                            ACCESS DENIED
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}
