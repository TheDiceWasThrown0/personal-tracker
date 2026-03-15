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
import { LayoutGrid, Map, Lock, Activity, Cookie, CalendarDays, ListTodo, BookOpen, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const C = {
  bg: '#2C1810',
  fg: '#F0DEC8',
  red: '#C07840',
  muted: '#9A806A',
  border: '#5A3820',
  cardBg: '#3A2216',
  softBorder: '#6A4830',
}

function SortableTab({ tab, isActive, onClick }: { tab: any; isActive: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  }

  return (
    <button
      ref={setNodeRef}
      style={{
        ...style,
        background: isActive ? C.red : 'transparent',
        color: isActive ? C.bg : C.muted,
        padding: '0.6rem 0.875rem',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        fontSize: '0.7rem',
        fontWeight: isActive ? 700 : 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        transition: 'all 0.1s',
        borderLeft: `3px solid ${isActive ? C.border : 'transparent'}`,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = C.fg; e.currentTarget.style.background = C.softBorder; } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; } }}
    >
      <tab.icon style={{ width: '13px', height: '13px', flexShrink: 0 }} />
      {tab.label}
    </button>
  )
}

type Tab = "dashboard" | "routine" | "planner" | "roadmap" | "fitness" | "cookie" | "skills"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [isUnlocked, setIsUnlocked] = useLocalStorage<boolean>("shijun-access-granted", false)
  const [isMounted, setIsMounted] = useState(false)
  const [tabsOrder, setTabsOrder] = useSyncedState<string[]>("tabs_order_v2", ["dashboard", "routine", "planner", "roadmap", "fitness", "cookie", "skills"])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const tabsPool: Record<string, { id: string; label: string; icon: any }> = {
    dashboard: { id: "dashboard", label: "Overview",          icon: LayoutGrid  },
    routine:   { id: "routine",   label: "Daily Routine",     icon: ListTodo    },
    planner:   { id: "planner",   label: "Planner",           icon: CalendarDays },
    roadmap:   { id: "roadmap",   label: "Path",              icon: Map         },
    fitness:   { id: "fitness",   label: "Fitness",           icon: Activity    },
    cookie:    { id: "cookie",    label: "Cookies",           icon: Cookie      },
    skills:    { id: "skills",    label: "Skills",            icon: BookOpen    },
  }

  const tabs = tabsOrder.map(id => tabsPool[id]).filter(Boolean)

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

  const ActiveIcon = tabsPool[activeTab]?.icon ?? LayoutGrid

  return (
    <main style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, color: C.fg, fontFamily: 'inherit' }}>

      {/* ── Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: '220px', borderRight: `1.5px solid ${C.border}`, background: C.bg }}
      >
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: `1.5px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
              <Image src="/duck_w_knife_transparent.png" alt="logo" fill style={{ objectFit: 'contain', filter: 'grayscale(1) contrast(1.4)' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Shijun <span style={{ color: C.red }}>&</span> Giorgia
            </span>
          </div>
          <p style={{ fontSize: '0.6rem', color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: '2.25rem' }}>
            Personal OS
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '0.5rem' }}>
          <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, padding: '0.5rem 1rem 0.35rem' }}>
            Navigation
          </p>
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
        <div style={{ padding: '0.875rem 1rem', borderTop: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6rem', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tokyo, JP</span>
          <button
            onClick={() => setIsUnlocked(false)}
            className="btn-wire"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem' }}
            title="Lock"
          >
            <Lock style={{ width: '11px', height: '11px' }} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 0 }}>

        {/* Top bar */}
        <div style={{ height: '48px', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem 0 2rem', flexShrink: 0, background: C.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ActiveIcon style={{ width: '13px', height: '13px', color: C.red }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {tabsPool[activeTab]?.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', background: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: '0.6rem', color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>online</span>
            </div>
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              style={{ background: 'transparent', border: 'none', color: C.fg, cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            >
              <Menu style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Scroll area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>

            {activeTab === "dashboard" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <HeroSection />
                <StatusDashboard />
              </div>
            )}

            {activeTab === "routine" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <SectionHeader label="Daily Protocol" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <DailySchedule />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <SectionHeader label="Daily Habits" small />
                    <DailyRoutine />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "planner" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <SectionHeader label="Strategic Operations" />
                <CalendarSystem />
              </div>
            )}

            {activeTab === "roadmap" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <SectionHeader label="The Journey" />
                <RoadmapTimeline />
              </div>
            )}

            {activeTab === "fitness" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <SectionHeader label="Bio-Infrastructure" />
                <GymTracker />
              </div>
            )}

            {activeTab === "cookie" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0.5rem 0 6rem' }}>
                <CookieTracker />
              </div>
            )}

            {activeTab === "skills" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <SectionHeader label="Skills & Academia" />
                <SkillAcademiaTracker />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          {/* Backdrop */}
          <div onClick={() => setMobileNavOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          {/* Drawer */}
          <aside style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '220px', background: C.bg, borderRight: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Navigation</span>
              <button onClick={() => setMobileNavOpen(false)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '0.5rem' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as Tab); setMobileNavOpen(false) }}
                  style={{
                    background: activeTab === tab.id ? C.red : 'transparent',
                    color: activeTab === tab.id ? C.bg : C.muted,
                    padding: '0.6rem 0.875rem',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontSize: '0.7rem',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    border: 'none',
                    borderLeft: `3px solid ${activeTab === tab.id ? C.border : 'transparent'}`,
                  }}
                >
                  <tab.icon style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div style={{ padding: '0.875rem 1rem', borderTop: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6rem', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tokyo, JP</span>
              <button onClick={() => setIsUnlocked(false)} className="btn-wire" style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem' }} title="Lock">
                <Lock style={{ width: '11px', height: '11px' }} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Global Diary */}
      <GlobalDiary />

      {/* AI Assistant */}
      <AIAssistant />
    </main>
  )
}

function SectionHeader({ label, small }: { label: string; small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <h2 style={{
        fontSize: small ? '0.65rem' : '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: C.muted,
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}>
        {label}
      </h2>
      <div style={{ flex: 1, height: '1.5px', background: C.border }} />
    </div>
  )
}
