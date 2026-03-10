"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useSyncedState } from "@/hooks/useSyncedState"
import { HeroSection } from "@/components/HeroSection"
import StatusDashboard from "@/components/StatusDashboard"
import { RoadmapTimeline } from "@/components/RoadmapTimeline"
import { DailyRoutine } from "@/components/DailyRoutine"
import GymTracker from "@/components/GymTracker"
import { CookieTracker } from "@/components/CookieTracker"
import LockScreen from "@/components/LockScreen"
import { CalendarSystem } from "@/components/CalendarSystem"
import { DailySchedule } from "@/components/DailySchedule"
import { GlobalDiary } from "@/components/GlobalDiary"
import { AIAssistant } from "@/components/AIAssistant"
import { SkillAcademiaTracker } from "@/components/SkillAcademiaTracker"
import { LayoutGrid, Map, Lock, Activity, Cookie, CalendarDays, ListTodo, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableTab({ tab, isActive, onClick }: { tab: any, isActive: boolean, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left touch-none group",
        isActive
          ? "bg-white/[0.06] text-[#e8e0d6]"
          : "text-[#7a7168] hover:text-[#c8bfb5] hover:bg-white/[0.03]"
      )}
    >
      <tab.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#e06d34]" : "text-[#5a5148] group-hover:text-[#9a8f84]")} />
      <span className="truncate">{tab.label}</span>
      {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-[#e06d34]" />}
    </button>
  )
}

type Tab = "dashboard" | "routine" | "planner" | "roadmap" | "fitness" | "cookie" | "skills"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [isUnlocked, setIsUnlocked] = useLocalStorage<boolean>("shijun-access-granted", false)
  const [isMounted, setIsMounted] = useState(false)
  const [tabsOrder, setTabsOrder] = useSyncedState<string[]>("tabs_order_v2", ["dashboard", "routine", "planner", "roadmap", "fitness", "cookie", "skills"])

  useEffect(() => { setIsMounted(true) }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const tabsPool = {
    dashboard: { id: "dashboard", label: "Overview",          icon: LayoutGrid },
    routine:   { id: "routine",   label: "Daily Routine",     icon: ListTodo   },
    planner:   { id: "planner",   label: "Planner",           icon: CalendarDays },
    roadmap:   { id: "roadmap",   label: "Path",              icon: Map        },
    fitness:   { id: "fitness",   label: "Bio-Infrastructure", icon: Activity  },
    cookie:    { id: "cookie",    label: "Cookies",           icon: Cookie     },
    skills:    { id: "skills",    label: "Skills & Academia", icon: BookOpen   },
  }

  const tabs = tabsOrder.map(id => tabsPool[id as keyof typeof tabsPool]).filter(Boolean)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setTabsOrder(items => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over?.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  if (isMounted && !isUnlocked) return <LockScreen onUnlock={() => setIsUnlocked(true)} />
  if (!isMounted) return null

  const ActiveIcon = tabsPool[activeTab].icon

  return (
    <main className="flex flex-col lg:flex-row h-screen overflow-hidden" style={{ background: 'hsl(24 8% 8%)', color: 'hsl(30 18% 88%)' }}>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 relative z-20" style={{ background: 'hsl(24 7% 10%)', borderRight: '1px solid hsl(24 6% 15%)' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid hsl(24 6% 15%)' }}>
          <div className="relative w-8 h-8 shrink-0">
            <Image src="/duck_w_knife_transparent.png" alt="logo" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight" style={{ color: 'hsl(30 18% 88%)' }}>
              Shijun <span style={{ color: '#e06d34' }}>&</span> Giorgia
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'hsl(30 8% 42%)' }}>Personal OS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(30 8% 36%)' }}>Navigation</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tabsOrder} strategy={verticalListSortingStrategy}>
              {tabs.map(tab => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid hsl(24 6% 15%)' }}>
          <span className="text-[11px]" style={{ color: 'hsl(30 8% 36%)' }}>Tokyo, JP</span>
          <button
            onClick={() => setIsUnlocked(false)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'hsl(30 8% 40%)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e06d34')}
            onMouseLeave={e => (e.currentTarget.style.color = 'hsl(30 8% 40%)')}
            title="Lock"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden flex flex-col pb-20 lg:pb-0">

        {/* Top bar */}
        <div className="h-14 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10" style={{ background: 'hsl(24 7% 10%)', borderBottom: '1px solid hsl(24 6% 15%)' }}>
          <div className="flex items-center gap-2.5">
            <ActiveIcon className="w-4 h-4" style={{ color: '#e06d34' }} />
            <span className="text-sm font-semibold" style={{ color: 'hsl(30 18% 88%)' }}>{tabsPool[activeTab].label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono" style={{ color: 'hsl(30 8% 40%)' }}>online</span>
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 lg:px-10 lg:py-10 space-y-10 animate-in fade-in duration-300">

            {activeTab === "dashboard" && (
              <div className="space-y-10">
                <HeroSection />
                <StatusDashboard />
              </div>
            )}

            {activeTab === "routine" && (
              <div className="space-y-8">
                <SectionHeader label="Daily Protocol" />
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <DailySchedule />
                  <div className="space-y-4">
                    <SectionHeader label="Daily Habits" small />
                    <DailyRoutine />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "planner" && (
              <div className="space-y-8">
                <SectionHeader label="Strategic Operations" />
                <CalendarSystem />
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="space-y-8">
                <SectionHeader label="The Journey" />
                <RoadmapTimeline />
              </div>
            )}

            {activeTab === "fitness" && (
              <div className="space-y-8">
                <SectionHeader label="Bio-Infrastructure" />
                <GymTracker />
              </div>
            )}

            {activeTab === "cookie" && (
              <div className="space-y-8 pt-2">
                <CookieTracker />
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-8">
                <SectionHeader label="Skills & Academia" />
                <SkillAcademiaTracker />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around rounded-2xl px-2 py-2" style={{ background: 'hsl(24 7% 12%)', border: '1px solid hsl(24 6% 18%)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className="flex flex-col items-center justify-center min-w-[3rem] h-11 rounded-xl transition-all"
              style={{
                background: active ? 'hsl(24 7% 18%)' : 'transparent',
                color: active ? '#e06d34' : 'hsl(30 8% 45%)'
              }}
            >
              <Icon className="w-4.5 h-4.5" />
            </button>
          )
        })}
      </nav>

      {/* Global Diary */}
      <GlobalDiary />

      {/* AI Assistant */}
      <AIAssistant />
    </main>
  )
}

function SectionHeader({ label, small }: { label: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <h2
        className={cn("font-semibold", small ? "text-base" : "text-lg")}
        style={{ color: 'hsl(30 18% 75%)' }}
      >
        {label}
      </h2>
      <div className="flex-1 h-px" style={{ background: 'hsl(24 6% 17%)' }} />
    </div>
  )
}
