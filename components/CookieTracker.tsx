"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cookie as CookieIcon, User, Trophy, Save } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type CookieStats = {
    total: number
    users: Record<string, number>
}

const DEFAULT_STATS: CookieStats = {
    total: 0,
    users: {}
}

export function CookieTracker() {
    const [stats, setStats] = useSyncedState<CookieStats>("cookie_stats_v1", DEFAULT_STATS)
    const [userName, setUserName] = useState<string>("")
    const [isNameSet, setIsNameSet] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const audioContextRef = useRef<AudioContext | null>(null)

    // Load local user name identity
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedName = window.localStorage.getItem("cookie_user_name")
            if (storedName) {
                setUserName(storedName)
                setIsNameSet(true)
            }
        }
    }, [])

    // Initialize Audio Context
    useEffect(() => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContext) {
            audioContextRef.current = new AudioContext()
        }
    }, [])

    const handleSaveName = () => {
        if (!userName.trim()) return
        window.localStorage.setItem("cookie_user_name", userName.trim())
        setIsNameSet(true)
    }

    const playCrunchSound = () => {
        if (!audioContextRef.current) return

        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') ctx.resume()

        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

        osc.start()
        osc.stop(ctx.currentTime + 0.1)
    }

    const eatCookie = () => {
        if (!isNameSet) return

        setStats(prev => ({
            total: (prev.total || 0) + 1,
            users: {
                ...prev.users,
                [userName]: (prev.users[userName] || 0) + 1
            }
        }))

        setIsAnimating(true)
        playCrunchSound()
        setTimeout(() => setIsAnimating(false), 150)
    }

    // Sort leaderboard
    const leaderboard = Object.entries(stats.users || {})
        .sort(([, a], [, b]) => b - a)

    if (!isNameSet) {
        return (
            <Card className="border-4 border-amber-500/20 bg-stone-900/50 backdrop-blur-md shadow-xl overflow-hidden max-w-md mx-auto">
                <CardHeader className="bg-amber-900/20 pb-4 border-b border-amber-500/10">
                    <CardTitle className="text-amber-400 font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <CookieIcon className="w-6 h-6" /> Cookie Jar
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-12 flex flex-col items-center gap-6">
                    <div className="text-center">
                        <h3 className="text-white font-bold text-lg mb-2">Who is clicking?</h3>
                        <p className="text-stone-400 text-sm">Enter your name to join the leaderboard.</p>
                    </div>
                    <div className="flex gap-2 w-full max-w-xs">
                        <input
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Your Name"
                            className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-4 py-2 text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        />
                        <button
                            onClick={handleSaveName}
                            className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-lg transition-colors"
                        >
                            <Save className="w-5 h-5" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-4 border-amber-500/20 bg-stone-900/50 backdrop-blur-md shadow-xl overflow-hidden max-w-md mx-auto">
            <CardHeader className="bg-amber-900/20 pb-4 border-b border-amber-500/10">
                <CardTitle className="text-amber-400 font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                    <CookieIcon className="w-6 h-6" /> Cookie Jar
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-12 flex flex-col items-center gap-8">

                <div className="text-center space-y-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Global Cookies Consumed</span>
                    <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] font-mono">
                        {stats.total || 0}
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={eatCookie}
                        className={cn(
                            "relative w-48 h-48 transition-transform cursor-pointer outline-none select-none z-10",
                            isAnimating ? "scale-90 rotate-3" : "hover:scale-105 active:scale-95"
                        )}
                    >
                        <Image
                            src="/cookie_v3.png"
                            alt="Delicious Cookie"
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </button>
                    {isAnimating && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-amber-400 animate-out fade-out slide-out-to-top-10 duration-500 pointer-events-none z-20">
                            +1
                        </div>
                    )}
                </div>

                <div className="w-full bg-stone-950/50 rounded-xl p-4 border border-stone-800">
                    <div className="flex items-center gap-2 mb-3 text-stone-400 text-xs font-bold uppercase tracking-wider">
                        <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {leaderboard.length === 0 ? (
                            <p className="text-stone-600 text-sm italic text-center py-2">No cookies eaten yet!</p>
                        ) : (
                            leaderboard.map(([name, count], index) => (
                                <div key={name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                            index === 0 ? "bg-yellow-500 text-black" :
                                                index === 1 ? "bg-stone-400 text-black" :
                                                    index === 2 ? "bg-orange-700 text-white" : "bg-stone-800 text-stone-400"
                                        )}>
                                            {index + 1}
                                        </span>
                                        <span className={cn(
                                            "font-medium",
                                            name === userName ? "text-amber-400" : "text-stone-300"
                                        )}>
                                            {name} {name === userName && "(You)"}
                                        </span>
                                    </div>
                                    <span className="font-mono text-stone-400">{count}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
