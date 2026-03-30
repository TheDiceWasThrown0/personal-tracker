"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { useState } from "react"
import { Plus, X, Check } from "lucide-react"

export type PuzzlePiece = {
  id: string
  title: string
  description: string
  category: 'academic' | 'financial' | 'physical' | 'technical' | 'lifestyle' | 'career'
  progress: number
  icon: string
}

type PuzzleData = { pieces: PuzzlePiece[] }

const DEFAULT_PIECES: PuzzlePiece[] = [
  { id: 'ib_score',        title: 'IB 43/45',              description: 'Achieve IB Diploma score of 43+ points',           category: 'academic',   progress: 20, icon: '📚' },
  { id: 'sophia',          title: 'Enter Sophia / Bocconi', description: 'University admission — Finance program',            category: 'academic',   progress: 10, icon: '🎓' },
  { id: 'body_70kg',       title: 'Physique 70kg',          description: 'Cut to 70kg while maintaining muscle mass',         category: 'physical',   progress: 30, icon: '💪' },
  { id: 'python_model',    title: 'Python Financial Model', description: 'Build a working quantitative trading model',         category: 'technical',  progress: 25, icon: '🐍' },
  { id: 'italian_b2',      title: 'Italian B2',             description: 'Achieve B2 Italian proficiency for Bocconi',        category: 'academic',   progress: 10, icon: '🇮🇹' },
  { id: 'gmat_790',        title: 'GMAT 790+',              description: 'Score 790 or above on GMAT',                        category: 'academic',   progress: 15, icon: '📊' },
  { id: 'net_10m',         title: '¥10M Net Worth',         description: 'Accumulate ¥10,000,000 in personal assets',         category: 'financial',  progress: 5,  icon: '💰' },
  { id: 'goldman',         title: 'Goldman Sachs',          description: 'Land Investment Banking position at GS',            category: 'career',     progress: 0,  icon: '🏛️' },
  { id: 'elite_network',   title: 'Elite Network',          description: 'Build connections with top-tier finance leaders',   category: 'career',     progress: 15, icon: '🤝' },
  { id: 'hedge_fund',      title: 'Launch Hedge Fund',      description: 'Establish own hedge fund by 2037',                  category: 'career',     progress: 0,  icon: '📈' },
  { id: 'azabudai',        title: 'Azabudai Hills',         description: 'Residence in Azabudai Hills, Tokyo',                category: 'lifestyle',  progress: 0,  icon: '🏙️' },
  { id: 'billion_aum',     title: '$1B AUM',                description: 'Manage $1 billion in assets under management',      category: 'financial',  progress: 0,  icon: '🎯' },
]

const DEFAULT_DATA: PuzzleData = { pieces: DEFAULT_PIECES }

const CAT_COLOR: Record<PuzzlePiece['category'], string> = {
  academic:  '#3b82f6',
  financial: '#22c55e',
  physical:  '#f59e0b',
  technical: '#8b5cf6',
  lifestyle: '#ec4899',
  career:    '#C07840',
}

const CAT_LABEL: Record<PuzzlePiece['category'], string> = {
  academic: 'Academic', financial: 'Financial', physical: 'Physical',
  technical: 'Technical', lifestyle: 'Lifestyle', career: 'Career',
}

const C = {
  bg: '#2C1810', fg: '#F0DEC8', red: '#C07840',
  muted: '#9A806A', border: '#5A3820', cardBg: '#3A2216', softBorder: '#6A4830',
}

export function PuzzleMap() {
  const [data, setData] = useSyncedState<PuzzleData>("puzzle_map_v1", DEFAULT_DATA)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editProgress, setEditProgress] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newCategory, setNewCategory] = useState<PuzzlePiece['category']>('academic')
  const [newIcon, setNewIcon] = useState("🎯")

  const pieces = data?.pieces ?? DEFAULT_PIECES
  const total = pieces.length > 0 ? pieces.reduce((s, p) => s + p.progress, 0) / pieces.length : 0
  const done = pieces.filter(p => p.progress === 100).length

  const updateProgress = (id: string, val: number) => {
    setData(prev => ({ pieces: (prev?.pieces ?? []).map(p => p.id === id ? { ...p, progress: val } : p) }))
    setEditingId(null)
  }

  const deletePiece = (id: string) => {
    setData(prev => ({ pieces: (prev?.pieces ?? []).filter(p => p.id !== id) }))
  }

  const addPiece = () => {
    if (!newTitle.trim()) return
    const piece: PuzzlePiece = {
      id: `piece_${Date.now()}`, title: newTitle.trim(), description: newDesc.trim(),
      category: newCategory, progress: 0, icon: newIcon || '🎯',
    }
    setData(prev => ({ pieces: [...(prev?.pieces ?? []), piece] }))
    setNewTitle(""); setNewDesc(""); setNewCategory('academic'); setNewIcon("🎯"); setShowAdd(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.25rem' }}>
            {done}/{pieces.length} Pieces Complete
          </p>
          <p style={{ fontSize: '0.65rem', color: C.muted }}>
            Every habit and session connects to a puzzle piece.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.muted, padding: '0.4rem 0.75rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <Plus style={{ width: '9px', height: '9px' }} /> Add Piece
        </button>
      </div>

      {/* Master Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted }}>
            Final Goal Resolution
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.red, fontFamily: 'monospace' }}>
            {total.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: '6px', background: C.cardBg, border: `1px solid ${C.border}`, position: 'relative' as const }}>
          <div style={{ height: '100%', width: `${total}%`, background: `linear-gradient(90deg, ${C.red}, #f59e0b)`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Puzzle Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {pieces.map(piece => {
          const col = CAT_COLOR[piece.category]
          const done = piece.progress === 100
          return (
            <div key={piece.id} style={{ background: C.cardBg, border: `1.5px solid ${done ? col : C.border}`, padding: '0.875rem', position: 'relative' as const, transition: 'border-color 0.2s' }}>
              {/* Category stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: col }} />
              {/* Delete */}
              <button onClick={() => deletePiece(piece.id)} style={{ position: 'absolute', top: '0.5rem', right: '0.4rem', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', opacity: 0.35, padding: '0.1rem' }}>
                <X style={{ width: '9px', height: '9px' }} />
              </button>
              {/* Content */}
              <div style={{ marginTop: '0.375rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{piece.icon}</span>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: done ? col : C.fg, lineHeight: 1.2, letterSpacing: '0.01em' }}>{piece.title}</p>
                  <p style={{ fontSize: '0.53rem', color: col, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginTop: '0.1rem' }}>{CAT_LABEL[piece.category]}</p>
                </div>
              </div>
              <p style={{ fontSize: '0.62rem', color: C.muted, lineHeight: 1.4, marginBottom: '0.625rem', minHeight: '2.2rem' }}>
                {piece.description}
              </p>
              {/* Progress control */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.53rem', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 700 }}>Progress</span>
                {editingId === piece.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <input type="number" min={0} max={100} value={editProgress}
                      onChange={e => setEditProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      style={{ width: '38px', background: C.bg, border: `1px solid ${C.border}`, color: C.fg, padding: '0.15rem 0.25rem', fontSize: '0.62rem', fontFamily: 'monospace', textAlign: 'center' as const, outline: 'none' }} />
                    <button onClick={() => updateProgress(piece.id, editProgress)} style={{ background: 'transparent', border: 'none', color: col, cursor: 'pointer', padding: '0.1rem' }}>
                      <Check style={{ width: '11px', height: '11px' }} />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.1rem' }}>
                      <X style={{ width: '11px', height: '11px' }} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingId(piece.id); setEditProgress(piece.progress) }}
                    style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '0.62rem', fontFamily: 'monospace', fontWeight: 700, padding: 0 }}>
                    {piece.progress}%
                  </button>
                )}
              </div>
              <div style={{ height: '3px', background: C.bg, border: `1px solid ${C.border}` }}>
                <div style={{ height: '100%', width: `${piece.progress}%`, background: col, transition: 'width 0.3s ease' }} />
              </div>
              {done && (
                <div style={{ position: 'absolute', top: '0.5rem', right: '1.25rem', background: col, color: '#000', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check style={{ width: '9px', height: '9px' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Final Goal Banner */}
      <div style={{ padding: '1.25rem', background: C.cardBg, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>🏆</span>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.fg, letterSpacing: '0.04em' }}>$1B AUM Hedge Fund</p>
            <p style={{ fontSize: '0.6rem', color: C.muted, marginTop: '0.15rem' }}>The final image — every piece must connect</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: C.red, fontFamily: 'monospace', lineHeight: 1 }}>{total.toFixed(0)}%</p>
          <p style={{ fontSize: '0.53rem', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Resolved</p>
        </div>
      </div>

      {/* Category Legend */}
      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem' }}>
        {(Object.entries(CAT_LABEL) as [PuzzlePiece['category'], string][]).map(([cat, label]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '8px', height: '8px', background: CAT_COLOR[cat] }} />
            <span style={{ fontSize: '0.58rem', color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowAdd(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{ position: 'relative', background: C.bg, border: `1.5px solid ${C.border}`, width: '100%', maxWidth: '440px', margin: '1rem' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Add Puzzle Piece</span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}><X style={{ width: '15px', height: '15px' }} /></button>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.375rem' }}>Icon + Title</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="🎯"
                    style={{ width: '44px', textAlign: 'center' as const, background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.45rem', fontSize: '1.125rem', outline: 'none', fontFamily: 'inherit' }} />
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Goal title..."
                    style={{ flex: 1, background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.45rem 0.75rem', fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.375rem' }}>Description</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does completing this mean?"
                  style={{ width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`, color: C.fg, padding: '0.45rem 0.75rem', fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.muted, display: 'block', marginBottom: '0.375rem' }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.3rem' }}>
                  {(Object.keys(CAT_COLOR) as PuzzlePiece['category'][]).map(cat => (
                    <button key={cat} onClick={() => setNewCategory(cat)}
                      style={{ background: newCategory === cat ? CAT_COLOR[cat] : C.cardBg, border: `1.5px solid ${newCategory === cat ? CAT_COLOR[cat] : C.border}`, color: newCategory === cat ? '#000' : C.muted, padding: '0.25rem 0.5rem', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {CAT_LABEL[cat]}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addPiece} disabled={!newTitle.trim()}
                style={{ background: newTitle.trim() ? C.red : C.cardBg, border: `1.5px solid ${newTitle.trim() ? C.red : C.border}`, color: newTitle.trim() ? C.bg : C.muted, padding: '0.7rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: newTitle.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                Add to Vision Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
