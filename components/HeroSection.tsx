"use client"

import { useEffect, useState } from "react"
import { intervalToDuration, type Duration } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSyncedState } from "@/hooks/useSyncedState"
import { Edit2, Check } from "lucide-react"

export function HeroSection() {
    const [targetDateStr, setTargetDateStr] = useSyncedState<string>("hero_targetDate", "2029-09-01T00:00:00")
    const [timeLeft, setTimeLeft] = useState<Duration>({})
    const [isEditing, setIsEditing] = useState(false)

    // Derived date object
    const targetDate = new Date(targetDateStr)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            if (now >= targetDate) {
                setTimeLeft({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
                // clearInterval(timer) // Don't clear interval to allow updates if date changes
                return
            }
            setTimeLeft(intervalToDuration({ start: now, end: targetDate }))
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDateStr, targetDate]) // Re-run when target string changes

    const formatTime = (val: number | undefined) => (val || 0).toString().padStart(2, "0")

    return (
        <div className="w-full mb-12 relative group">
            <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-4 right-4 z-20 bg-white/50 p-2 rounded-full hover:bg-white text-stone-400 hover:text-primary transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
                {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>

            <Card className="bg-white/80 backdrop-blur-sm border-4 border-white shadow-[8px_8px_0px_0px_#fb923c] overflow-hidden">
                <div className="bg-secondary p-4 text-center transition-all duration-500">
                    {isEditing ? (
                        <div className="flex flex-col items-center gap-2">
                            <label className="text-white text-xs font-bold uppercase">Set Target Date</label>
                            <input
                                type="datetime-local"
                                value={targetDateStr}
                                onChange={(e) => setTargetDateStr(e.target.value)}
                                className="text-stone-800 font-bold p-1 rounded text-center"
                            />
                        </div>
                    ) : (
                        <h2 className="text-white font-black text-xl tracking-wider uppercase drop-shadow-md">
                            Countdown to Bocconi
                        </h2>
                    )}
                </div>
                <CardContent className="pt-8 pb-8">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 text-center">
                        {["years", "months", "days", "hours", "minutes", "seconds"].map((unit) => (
                            <div key={unit} className="flex flex-col items-center group transition-transform hover:scale-110 duration-300">
                                <div className="bg-muted w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center border-2 md:border-4 border-white shadow-inner mb-1 md:mb-2">
                                    <span className="text-xl md:text-3xl lg:text-4xl font-extrabold text-primary tabular-nums drop-shadow-sm">
                                        {/* @ts-ignore duration keys check */}
                                        {formatTime(timeLeft[unit as keyof Duration])}
                                    </span>
                                </div>
                                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase">{unit}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
