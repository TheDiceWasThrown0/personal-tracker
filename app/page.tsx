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
import { GlobalDiary } from "@/components/GlobalDiary"
import { DailySchedule } from "@/components/DailySchedule"
import { AIAssistant } from "@/components/AIAssistant"
import { LayoutGrid, Map, Lock, Activity, Cookie, CalendarDays, ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"
// DnD Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Component for Sortable Tab
function SortableTab({ tab, isActive, onClick }: { tab: any, isActive: boolean, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all transform hover:translate-x-1 border w-full text-left touch-none",
        isActive
          ? "bg-stone-800 border-stone-600 shadow-lg text-stone-100"
          : "bg-transparent border-transparent text-stone-400 hover:bg-stone-800/40 hover:text-stone-300"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg border",
          isActive ? "bg-stone-700 border-stone-500 text-orange-400" : "border-stone-800 bg-stone-900 " + tab.color.split(' ')[1] // Extract text color
        )}
      >
        <tab.icon className="w-4 h-4" />
      </div>
      <span className="truncate">{tab.label}</span>

      {/* Active Indicator Dot */}
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
      )}
    </button>
  );
}

type Tab = "dashboard" | "routine" | "planner" | "roadmap" | "fitness" | "cookie";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [isUnlocked, setIsUnlocked] = useLocalStorage<boolean>("shijun-access-granted", false)
  const [isMounted, setIsMounted] = useState(false)

  // State for Tabs Order - Synced
  const [tabsOrder, setTabsOrder] = useSyncedState<string[]>("tabs_order_v2", ["dashboard", "routine", "planner", "roadmap", "fitness", "cookie"])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Dnd Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const tabsPool = {
    dashboard: { id: "dashboard", label: "Overview", icon: LayoutGrid, color: "bg-orange-900/40 text-orange-200 border-orange-500/30 hover:bg-orange-900/60" },
    routine: { id: "routine", label: "Daily Routine", icon: ListTodo, color: "bg-cyan-900/40 text-cyan-200 border-cyan-500/30 hover:bg-cyan-900/60" },
    planner: { id: "planner", label: "Planner", icon: CalendarDays, color: "bg-purple-900/40 text-purple-200 border-purple-500/30 hover:bg-purple-900/60" },
    roadmap: { id: "roadmap", label: "Path", icon: Map, color: "bg-yellow-900/40 text-yellow-200 border-yellow-500/30 hover:bg-yellow-900/60" },
    fitness: { id: "fitness", label: "Bio-Infrastructure", icon: Activity, color: "bg-rose-900/40 text-rose-200 border-rose-500/30 hover:bg-rose-900/60" },
    cookie: { id: "cookie", label: "Cookies", icon: Cookie, color: "bg-amber-900/40 text-amber-200 border-amber-500/30 hover:bg-amber-900/60" },
  }

  // Derived tabs list based on order
  const tabs = tabsOrder.map(id => tabsPool[id as keyof typeof tabsPool]).filter(Boolean)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setTabsOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over?.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId)
  }

  if (isMounted && !isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />
  }

  if (!isMounted) return null

  const handleLogout = () => {
    setIsUnlocked(false)
  }

  const ActiveIcon = tabsPool[activeTab].icon

  return (
    <main className="flex flex-col lg:flex-row h-screen font-sans selection:bg-orange-500/30 selection:text-orange-100 overflow-hidden bg-stone-950">

      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-full lg:w-72 bg-stone-900/50 border-r border-stone-800 flex-col flex-shrink-0 relative z-20 overflow-y-auto lg:overflow-y-visible">
        <div className="p-6 flex flex-col gap-6">

          {/* Header Area in Sidebar */}
          <div className="flex flex-col items-center lg:items-start border-b border-stone-800 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-12 h-12 -rotate-12 hover:rotate-0 transition-transform">
                <Image src="/duck_w_knife_transparent.png" alt="Duck with Knife" fill className="object-contain drop-shadow-md" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-stone-200 leading-tight">
                Shijun <span className="text-orange-500">&</span> Giorgia
              </h1>
            </div>
            <p className="text-xs font-mono text-stone-500 pl-1">Room 🍂 Analysis & Ops</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col gap-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tabsOrder}
                strategy={verticalListSortingStrategy}
              >
                {tabs.map((tab) => (
                  <SortableTab
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => handleTabClick(tab.id as Tab)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto p-6 border-t border-stone-800">
          <div className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-stone-500 font-mono">
                <p>TOKYO, JP</p>
                <p>35.6°N 139.6°E</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-stone-800 text-stone-600 hover:text-red-400 transition-colors"
                title="Lock Session"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-stone-700 text-center mt-4 font-bold uppercase tracking-widest">
            © 2026 - 2030 USER
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-background pb-24 lg:pb-0">
        {/* Projected Screen Effect / Header for Content */}
        <div className="h-16 border-b border-stone-800 flex items-center justify-between px-8 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-xl font-bold text-stone-200 flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${tabsPool[activeTab].color.split(' ')[0]} bg-opacity-20`}>
              <ActiveIcon className={`w-5 h-5 ${tabsPool[activeTab].color.split(' ')[1]}`} />
            </div>
            {tabsPool[activeTab].label}
          </h2>
          <div className="flex items-center gap-4">
            {/* Could put quick actions or breadcrumbs here */}
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-stone-500">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {activeTab === "dashboard" && (
              <div className="space-y-12">
                <HeroSection />
                <StatusDashboard />
              </div>
            )}

            {activeTab === "routine" && (
              <div className="space-y-12">
                <div className="bg-stone-900/40 w-fit px-4 py-2 rounded-full border border-cyan-500/30 shadow-sm mx-auto mb-8 backdrop-blur-sm">
                  <h2 className="text-xl font-extrabold text-stone-300 flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-cyan-400" /> Daily Protocol
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <DailySchedule />
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="bg-stone-900/40 w-fit px-4 py-2 rounded-full border border-orange-500/30 shadow-sm backdrop-blur-sm mb-4">
                      <h2 className="text-xl font-extrabold text-stone-300 flex items-center gap-2">
                        📅 Daily Habits
                      </h2>
                    </div>
                    <DailyRoutine />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "planner" && (
              <div className="space-y-6">
                <div className="bg-stone-900/40 w-fit px-4 py-2 rounded-full border border-purple-500/30 shadow-sm mx-auto mb-8 backdrop-blur-sm">
                  <h2 className="text-xl font-extrabold text-stone-300 flex items-center gap-2">
                    📅 Strategic Operations
                  </h2>
                </div>
                <CalendarSystem />
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="space-y-6">
                <div className="bg-stone-900/40 w-fit px-4 py-2 rounded-full border border-yellow-500/30 shadow-sm backdrop-blur-sm">
                  <h2 className="text-xl font-extrabold text-stone-300 flex items-center gap-2">
                    🌱 The Journey
                  </h2>
                </div>
                <RoadmapTimeline />
              </div>
            )}

            {activeTab === "fitness" && (
              <div className="space-y-6">
                <div className="bg-stone-900/40 w-fit px-4 py-2 rounded-full border border-rose-500/30 shadow-sm mx-auto mb-8 backdrop-blur-sm">
                  <h2 className="text-xl font-extrabold text-stone-300 flex items-center gap-2">
                    🧬 Bio-Infrastructure
                  </h2>
                </div>
                <GymTracker />
              </div>
            )}

            {activeTab === "cookie" && (
              <div className="space-y-6 mt-12">
                <CookieTracker />
              </div>
            )}

            <div className="mt-12">
              <GlobalDiary />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-stone-900/90 backdrop-blur-xl border border-stone-800/50 rounded-2xl shadow-2xl z-50 px-2 flex items-center justify-between overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as Tab)}
              className={`flex flex-col items-center justify-center min-w-[3.5rem] h-12 rounded-xl transition-all duration-300 relative ${active ? 'bg-stone-800 text-orange-500 -translate-y-2 shadow-lg border border-stone-700' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <Icon className={`w-5 h-5 ${active ? '' : 'opacity-70'}`} />
              {active && (
                <span className="absolute -bottom-5 text-[9px] font-bold tracking-wide text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800">
                  {tab.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* AI Assistant Overlay */}
      <AIAssistant />
    </main>
  )
}

