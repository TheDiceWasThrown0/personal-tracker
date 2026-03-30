"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { useState } from "react"
import { Plus, X, Trash2 } from "lucide-react"

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
  { id: 'ib_score',      title: 'IB 43/45',              description: 'Achieve IB Diploma score of 43+ points',          category: 'academic',   progress: 20, icon: '📚' },
  { id: 'sophia',        title: 'Enter Sophia/Bocconi',  description: 'University admission — Finance program',           category: 'academic',   progress: 10, icon: '🎓' },
  { id: 'body_70kg',     title: 'Physique 70kg',         description: 'Cut to 70kg while maintaining muscle mass',        category: 'physical',   progress: 30, icon: '💪' },
  { id: 'python_model',  title: 'Python Quant Model',    description: 'Build a working quantitative trading model',        category: 'technical',  progress: 25, icon: '🐍' },
  { id: 'italian_b2',   title: 'Italian B2',            description: 'Achieve B2 Italian proficiency for Bocconi',       category: 'academic',   progress: 10, icon: '🇮🇹' },
  { id: 'gmat_790',      title: 'GMAT 790+',             description: 'Score 790 or above on GMAT',                       category: 'academic',   progress: 15, icon: '📊' },
  { id: 'net_10m',       title: '¥10M Net Worth',        description: 'Accumulate ¥10,000,000 in personal assets',        category: 'financial',  progress: 5,  icon: '💰' },
  { id: 'goldman',       title: 'Goldman Sachs',         description: 'Land Investment Banking position at GS',           category: 'career',     progress: 0,  icon: '🏛️' },
  { id: 'elite_network', title: 'Elite Network',         description: 'Build connections with top-tier finance leaders',  category: 'career',     progress: 15, icon: '🤝' },
  { id: 'hedge_fund',    title: 'Launch Hedge Fund',     description: 'Establish own hedge fund by 2037',                 category: 'career',     progress: 0,  icon: '📈' },
  { id: 'azabudai',      title: 'Azabudai Hills',        description: 'Residence in Azabudai Hills, Tokyo',               category: 'lifestyle',  progress: 0,  icon: '🏙️' },
  { id: 'billion_aum',   title: '$1B AUM',               description: 'Manage $1 billion in assets under management',     category: 'financial',  progress: 0,  icon: '🎯' },
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

// Puzzle piece SVG path — body occupies (0,0)→(200,200)
// Top edge:    tab bumps OUT  (up,    y goes to -28)
// Right edge:  tab bumps OUT  (right, x goes to 228)
// Bottom edge: blank dips IN  (up,    y comes to  172 from 200)
// Left edge:   blank dips IN  (right, x comes to  28  from 0)
const PUZZLE_PATH =
  "M 0,0 " +
  "L 75,0 C 75,-12 88,-30 100,-30 C 112,-30 125,-12 125,0 " +
  "L 200,0 " +
  "L 200,75 C 212,75 230,88 230,100 C 230,112 212,125 200,125 " +
  "L 200,200 " +
  "L 125,200 C 125,212 112,172 100,172 C 88,172 75,212 75,200 " +
  "L 0,200 " +
  "L 0,125 C -12,125 28,112 28,100 C 28,88 -12,75 0,75 " +
  "Z"

// ViewBox with margin around the body to show tabs
const VBOX = "-35 -35 270 270"

function PieceCard({ piece, onClick }: { piece: PuzzlePiece; onClick: () => void }) {
  const clipId = `pc_${piece.id.replace(/[^a-zA-Z0-9]/g, '_')}`
  const col = CAT_COLOR[piece.category]
  const isComplete = piece.progress === 100

  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' as const }}
      title={`${piece.title} — ${piece.progress}% — click to edit`}
    >
      <svg
        viewBox={VBOX}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={PUZZLE_PATH} />
          </clipPath>
          {isComplete && (
            <filter id={`glow_${clipId}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>

        {/* Base background */}
        <path
          d={PUZZLE_PATH}
          fill={C.cardBg}
          stroke={isComplete ? col : C.border}
          strokeWidth={isComplete ? "2" : "1.5"}
          filter={isComplete ? `url(#glow_${clipId})` : undefined}
        />

        {/* Progress fill — rises from bottom */}
        {piece.progress > 0 && (
          <rect
            x={0}
            y={200 * (1 - piece.progress / 100)}
            width={200}
            height={200 * piece.progress / 100}
            fill={col}
            opacity={isComplete ? 0.5 : 0.28}
            clipPath={`url(#${clipId})`}
          />
        )}

        {/* Category accent — thin inner stroke */}
        <path
          d={PUZZLE_PATH}
          fill="none"
          stroke={col}
          strokeWidth="0.8"
          opacity="0.35"
        />
      </svg>

      {/* HTML content — centered within the piece body (approx 18%–82% of rendered size) */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '20%', right: '20%', bottom: '20%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', gap: '0.15rem',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: 'clamp(1rem, 3.5vw, 1.5rem)', lineHeight: 1 }}>{piece.icon}</span>
        <p style={{
          fontSize: 'clamp(0.48rem, 1.1vw, 0.65rem)',
          fontWeight: 800,
          color: isComplete ? col : C.fg,
          lineHeight: 1.2, margin: 0,
          wordBreak: 'break-word' as const,
          maxWidth: '100%',
        }}>
          {piece.title}
        </p>
        <p style={{
          fontSize: 'clamp(0.38rem, 0.85vw, 0.48rem)',
          color: col, fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase' as const,
          margin: 0,
        }}>
          {CAT_LABEL[piece.category]}
        </p>
        <p style={{
          fontSize: 'clamp(0.52rem, 1.2vw, 0.68rem)',
          fontWeight: 800,
          color: isComplete ? col : C.muted,
          fontFamily: 'monospace', margin: 0,
        }}>
          {piece.progress}%
        </p>
      </div>
    </div>
  )
}

function AddPieceCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' as const, opacity: 0.45 }}
      title="Add new puzzle piece"
    >
      <svg viewBox={VBOX} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <path d={PUZZLE_PATH} fill="transparent" stroke={C.border} strokeWidth="1.5" strokeDasharray="7 5" />
      </svg>
      <div style={{
        position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.25rem', pointerEvents: 'none',
      }}>
        <Plus style={{ width: '20px', height: '20px', color: C.muted }} />
        <p style={{ fontSize: '0.5rem', color: C.muted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, margin: 0 }}>
          Add
        </p>
      </div>
    </div>
  )
}

const FORM_INPUT: React.CSSProperties = {
  width: '100%', background: C.cardBg, border: `1.5px solid ${C.border}`,
  color: C.fg, padding: '0.5rem 0.75rem', fontSize: '0.75rem',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
const FORM_LABEL: React.CSSProperties = {
  fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: '0.375rem',
}
const BTN_BASE: React.CSSProperties = {
  padding: '0.65rem', fontSize: '0.65rem', fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', border: 'none',
}

function PieceForm({
  title: initialTitle, desc: initialDesc, category: initialCat, icon: initialIcon, progress: initialProgress,
  onSave, onCancel, onDelete,
  isNew,
}: {
  title: string, desc: string, category: PuzzlePiece['category'], icon: string, progress: number,
  onSave: (p: { title: string, desc: string, category: PuzzlePiece['category'], icon: string, progress: number }) => void,
  onCancel: () => void,
  onDelete?: () => void,
  isNew?: boolean,
}) {
  const [title, setTitle] = useState(initialTitle)
  const [desc, setDesc] = useState(initialDesc)
  const [category, setCategory] = useState<PuzzlePiece['category']>(initialCat)
  const [icon, setIcon] = useState(initialIcon)
  const [progress, setProgress] = useState(initialProgress)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const col = CAT_COLOR[category]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1.25rem' }}>
      {/* Icon + Title */}
      <div>
        <label style={FORM_LABEL}>Icon + Title</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🎯"
            style={{ ...FORM_INPUT, width: '48px', textAlign: 'center', fontSize: '1.2rem', padding: '0.45rem' }} />
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title..."
            style={{ ...FORM_INPUT, flex: 1 }} />
        </div>
      </div>
      {/* Description */}
      <div>
        <label style={FORM_LABEL}>Description</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does completing this mean?"
          style={FORM_INPUT} />
      </div>
      {/* Category */}
      <div>
        <label style={FORM_LABEL}>Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.3rem' }}>
          {(Object.keys(CAT_COLOR) as PuzzlePiece['category'][]).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ background: category === cat ? CAT_COLOR[cat] : C.cardBg, border: `1.5px solid ${category === cat ? CAT_COLOR[cat] : C.border}`, color: category === cat ? '#000' : C.muted, padding: '0.25rem 0.5rem', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
              {CAT_LABEL[cat]}
            </button>
          ))}
        </div>
      </div>
      {/* Progress */}
      {!isNew && (
        <div>
          <label style={FORM_LABEL}>
            Progress — <span style={{ color: col, fontFamily: 'monospace' }}>{progress}%</span>
          </label>
          <input
            type="range" min={0} max={100} value={progress}
            onChange={e => setProgress(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: col, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            {[0, 25, 50, 75, 100].map(v => (
              <button key={v} onClick={() => setProgress(v)}
                style={{ background: progress === v ? col : C.cardBg, border: `1px solid ${progress === v ? col : C.border}`, color: progress === v ? '#000' : C.muted, padding: '0.2rem 0.4rem', fontSize: '0.55rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                {v}%
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        {onDelete && !confirmDelete && (
          <button onClick={() => setConfirmDelete(true)}
            style={{ ...BTN_BASE, background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.65rem 0.75rem' }}>
            <Trash2 style={{ width: '12px', height: '12px' }} />
          </button>
        )}
        {onDelete && confirmDelete && (
          <button onClick={onDelete}
            style={{ ...BTN_BASE, background: '#dc2626', color: '#fff', flex: 1 }}>
            Confirm Delete
          </button>
        )}
        {!confirmDelete && (
          <>
            <button onClick={onCancel}
              style={{ ...BTN_BASE, flex: 1, background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted }}>
              Cancel
            </button>
            <button
              onClick={() => { if (title.trim()) onSave({ title, desc, category, icon, progress }) }}
              disabled={!title.trim()}
              style={{ ...BTN_BASE, flex: 2, background: title.trim() ? col : C.cardBg, border: `1.5px solid ${title.trim() ? col : C.border}`, color: title.trim() ? '#000' : C.muted, cursor: title.trim() ? 'pointer' : 'not-allowed' }}>
              {isNew ? 'Add Piece' : 'Save Changes'}
            </button>
          </>
        )}
        {confirmDelete && (
          <button onClick={() => setConfirmDelete(false)}
            style={{ ...BTN_BASE, flex: 1, background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted }}>
            Keep
          </button>
        )}
      </div>
    </div>
  )
}

export function PuzzleMap() {
  const [data, setData] = useSyncedState<PuzzleData>("puzzle_map_v1", DEFAULT_DATA)
  const [editingPiece, setEditingPiece] = useState<PuzzlePiece | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const pieces = data?.pieces ?? DEFAULT_PIECES
  const total = pieces.length > 0 ? pieces.reduce((s, p) => s + p.progress, 0) / pieces.length : 0
  const doneCount = pieces.filter(p => p.progress === 100).length

  const savePiece = (id: string, fields: { title: string, desc: string, category: PuzzlePiece['category'], icon: string, progress: number }) => {
    setData(prev => ({
      pieces: (prev?.pieces ?? []).map(p =>
        p.id === id ? { ...p, title: fields.title, description: fields.desc, category: fields.category, icon: fields.icon, progress: fields.progress } : p
      )
    }))
    setEditingPiece(null)
  }

  const deletePiece = (id: string) => {
    setData(prev => ({ pieces: (prev?.pieces ?? []).filter(p => p.id !== id) }))
    setEditingPiece(null)
  }

  const addPiece = (fields: { title: string, desc: string, category: PuzzlePiece['category'], icon: string, progress: number }) => {
    const piece: PuzzlePiece = {
      id: `piece_${Date.now()}`, title: fields.title, description: fields.desc,
      category: fields.category, progress: 0, icon: fields.icon || '🎯',
    }
    setData(prev => ({ pieces: [...(prev?.pieces ?? []), piece] }))
    setShowAdd(false)
  }

  return (
    <div>
      {/* Header stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.53rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.1rem' }}>Pieces Complete</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: C.red, fontFamily: 'monospace', lineHeight: 1 }}>{doneCount}<span style={{ fontSize: '1rem', color: C.muted }}>/{pieces.length}</span></p>
          </div>
          <div>
            <p style={{ fontSize: '0.53rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.1rem' }}>Final Goal Resolution</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: C.fg, fontFamily: 'monospace', lineHeight: 1 }}>{total.toFixed(0)}<span style={{ fontSize: '1rem', color: C.muted }}>%</span></p>
          </div>
        </div>
        <p style={{ fontSize: '0.62rem', color: C.muted, maxWidth: '200px', lineHeight: 1.5, textAlign: 'right' as const }}>
          Click any piece to edit progress, title, or delete it.
        </p>
      </div>

      {/* Master progress bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ height: '5px', background: C.cardBg, border: `1px solid ${C.border}` }}>
          <div style={{ height: '100%', width: `${total}%`, background: `linear-gradient(90deg, ${C.red}, #f59e0b)`, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Puzzle grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '0.375rem', marginBottom: '2rem' }}>
        {pieces.map(piece => (
          <PieceCard key={piece.id} piece={piece} onClick={() => setEditingPiece(piece)} />
        ))}
        <AddPieceCard onClick={() => setShowAdd(true)} />
      </div>

      {/* Final goal banner */}
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

      {/* Category legend */}
      <div style={{ marginTop: '0.875rem', display: 'flex', flexWrap: 'wrap' as const, gap: '0.625rem' }}>
        {(Object.entries(CAT_LABEL) as [PuzzlePiece['category'], string][]).map(([cat, label]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '7px', height: '7px', background: CAT_COLOR[cat] }} />
            <span style={{ fontSize: '0.55rem', color: C.muted, letterSpacing: '0.07em', textTransform: 'uppercase' as const, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPiece && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setEditingPiece(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{ position: 'relative', background: C.bg, border: `1.5px solid ${C.border}`, width: '100%', maxWidth: '460px', margin: '1rem', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, background: C.bg, zIndex: 1 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Edit Puzzle Piece</span>
              <button onClick={() => setEditingPiece(null)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
            <PieceForm
              title={editingPiece.title}
              desc={editingPiece.description}
              category={editingPiece.category}
              icon={editingPiece.icon}
              progress={editingPiece.progress}
              onSave={(fields) => savePiece(editingPiece.id, fields)}
              onCancel={() => setEditingPiece(null)}
              onDelete={() => deletePiece(editingPiece.id)}
            />
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowAdd(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{ position: 'relative', background: C.bg, border: `1.5px solid ${C.border}`, width: '100%', maxWidth: '460px', margin: '1rem', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, background: C.bg, zIndex: 1 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>New Puzzle Piece</span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
            <PieceForm
              title="" desc="" category="academic" icon="🎯" progress={0}
              onSave={addPiece}
              onCancel={() => setShowAdd(false)}
              isNew
            />
          </div>
        </div>
      )}
    </div>
  )
}
