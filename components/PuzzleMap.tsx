"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { useState, useRef } from "react"
import { Plus, X, Trash2, ExternalLink, FileText, Link, LayoutGrid } from "lucide-react"

export type PieceLink = { label: string; url: string }

export type PuzzlePiece = {
  id: string
  title: string
  description: string
  category: 'academic' | 'financial' | 'physical' | 'technical' | 'lifestyle' | 'career'
  progress: number
  icon: string
  notes?: string
  links?: PieceLink[]
}

type PuzzleData = {
  pieces: PuzzlePiece[]
  positions?: Record<string, { x: number; y: number }>
}

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

const VBOX = "-35 -35 270 270"

// Canvas layout constants
const PIECE_W = 155
const PIECE_H = 160
const GRID_COLS = 4
const GRID_GAP = 26
const CONNECTION_DIST = 230  // px between piece centers to show connection

function defaultPos(idx: number) {
  return {
    x: 16 + (idx % GRID_COLS) * (PIECE_W + GRID_GAP),
    y: 16 + Math.floor(idx / GRID_COLS) * (PIECE_H + GRID_GAP),
  }
}

function PieceVisual({ piece, isDragging }: { piece: PuzzlePiece; isDragging: boolean }) {
  const clipId = `pc_${piece.id.replace(/[^a-zA-Z0-9]/g, '_')}`
  const col = CAT_COLOR[piece.category]
  const isComplete = piece.progress === 100
  const hasNotes = !!(piece.notes?.trim())
  const hasLinks = !!(piece.links?.length)

  return (
    <div style={{ position: 'relative', userSelect: 'none' as const }}>
      <svg viewBox={VBOX} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <clipPath id={clipId}><path d={PUZZLE_PATH} /></clipPath>
          {isComplete && (
            <filter id={`glow_${clipId}`}>
              <feGaussianBlur stdDeviation={isDragging ? "2" : "5"} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        <path d={PUZZLE_PATH} fill={C.cardBg}
          stroke={isComplete ? col : C.border}
          strokeWidth={isComplete ? "2.5" : "1.5"}
          filter={isComplete ? `url(#glow_${clipId})` : undefined} />
        {piece.progress > 0 && (
          <rect
            x={0} y={200 * (1 - piece.progress / 100)}
            width={200} height={200 * piece.progress / 100}
            fill={col} opacity={isComplete ? 0.55 : 0.3}
            clipPath={`url(#${clipId})`}
          />
        )}
        <path d={PUZZLE_PATH} fill="none" stroke={col} strokeWidth="0.8" opacity="0.4" />
        {isComplete && (
          <path d={PUZZLE_PATH} fill="none" stroke={col} strokeWidth="1.5"
            opacity="0.8" strokeDasharray="14 6" />
        )}
      </svg>

      <div style={{
        position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', gap: '0.12rem', pointerEvents: 'none', overflow: 'hidden',
      }}>
        <span style={{ fontSize: 'clamp(1rem, 3.5vw, 1.5rem)', lineHeight: 1 }}>{piece.icon}</span>
        <p style={{
          fontSize: 'clamp(0.48rem, 1.1vw, 0.62rem)', fontWeight: 800,
          color: isComplete ? col : C.fg, lineHeight: 1.2, margin: 0,
          wordBreak: 'break-word' as const, maxWidth: '100%',
        }}>
          {piece.title}
        </p>
        <p style={{
          fontSize: 'clamp(0.38rem, 0.85vw, 0.46rem)', color: col, fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase' as const, margin: 0,
        }}>
          {CAT_LABEL[piece.category]}
        </p>
        <p style={{
          fontSize: 'clamp(0.52rem, 1.2vw, 0.65rem)', fontWeight: 800,
          color: isComplete ? col : C.muted, fontFamily: 'monospace', margin: 0,
        }}>
          {piece.progress}%
        </p>
        {isComplete && (
          <p style={{ fontSize: '0.42rem', color: col, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, margin: 0 }}>
            ✓ Connected
          </p>
        )}
        {(hasNotes || hasLinks) && (
          <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.1rem' }}>
            {hasNotes && <div style={{ width: '4px', height: '4px', background: C.muted, borderRadius: '50%' }} />}
            {hasLinks && <div style={{ width: '4px', height: '4px', background: col, borderRadius: '50%' }} />}
          </div>
        )}
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

type FormFields = {
  title: string, desc: string, category: PuzzlePiece['category'],
  icon: string, progress: number, notes: string, links: PieceLink[]
}

function PieceForm({
  initial, onSave, onCancel, onDelete, isNew,
}: {
  initial: FormFields
  onSave: (f: FormFields) => void
  onCancel: () => void
  onDelete?: () => void
  isNew?: boolean
}) {
  const [title, setTitle] = useState(initial.title)
  const [desc, setDesc] = useState(initial.desc)
  const [category, setCategory] = useState<PuzzlePiece['category']>(initial.category)
  const [icon, setIcon] = useState(initial.icon)
  const [progress, setProgress] = useState(initial.progress)
  const [notes, setNotes] = useState(initial.notes)
  const [links, setLinks] = useState<PieceLink[]>(initial.links)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'links'>('info')

  const col = CAT_COLOR[category]

  const addLink = () => setLinks(l => [...l, { label: '', url: '' }])
  const updateLink = (i: number, field: 'label' | 'url', val: string) =>
    setLinks(l => l.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  const removeLink = (i: number) => setLinks(l => l.filter((_, idx) => idx !== i))

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    background: 'transparent', border: 'none',
    borderBottom: `2px solid ${active ? col : 'transparent'}`,
    color: active ? col : C.muted,
    padding: '0.5rem 0.75rem', fontSize: '0.6rem', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.border}`, paddingLeft: '1.25rem' }}>
        <button style={TAB_STYLE(activeTab === 'info')} onClick={() => setActiveTab('info')}>Info</button>
        <button style={TAB_STYLE(activeTab === 'notes')} onClick={() => setActiveTab('notes')}>
          <FileText style={{ width: '10px', height: '10px' }} /> Notes
          {notes.trim() && <span style={{ width: '5px', height: '5px', background: C.muted, borderRadius: '50%', display: 'inline-block' }} />}
        </button>
        <button style={TAB_STYLE(activeTab === 'links')} onClick={() => setActiveTab('links')}>
          <Link style={{ width: '10px', height: '10px' }} /> Links
          {links.length > 0 && <span style={{ fontSize: '0.55rem', background: col, color: '#000', padding: '0 4px', fontFamily: 'monospace', fontWeight: 800 }}>{links.length}</span>}
        </button>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {activeTab === 'info' && (
          <>
            <div>
              <label style={FORM_LABEL}>Icon + Title</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🎯"
                  style={{ ...FORM_INPUT, width: '48px', textAlign: 'center', fontSize: '1.2rem', padding: '0.45rem' }} />
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title..."
                  style={{ ...FORM_INPUT, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={FORM_LABEL}>Description</label>
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does completing this mean?"
                style={FORM_INPUT} />
            </div>
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
            {!isNew && (
              <div>
                <label style={FORM_LABEL}>
                  Progress — <span style={{ color: col, fontFamily: 'monospace' }}>{progress}%</span>
                </label>
                <input type="range" min={0} max={100} value={progress}
                  onChange={e => setProgress(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: col, cursor: 'pointer' }} />
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
          </>
        )}

        {activeTab === 'notes' && (
          <div>
            <label style={FORM_LABEL}>Notes & Research</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes, research, key facts, deadlines, requirements — anything relevant to this goal..."
              rows={12}
              style={{ ...FORM_INPUT, resize: 'vertical' as const, lineHeight: 1.6 }}
            />
            <p style={{ fontSize: '0.55rem', color: C.muted, marginTop: '0.375rem' }}>
              {notes.trim().length > 0 ? `${notes.trim().length} characters` : 'Empty'}
            </p>
          </div>
        )}

        {activeTab === 'links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <label style={FORM_LABEL}>Resource Links</label>
            {links.length === 0 && (
              <p style={{ fontSize: '0.65rem', color: C.muted, fontStyle: 'italic' }}>No links yet. Add websites, docs, or references.</p>
            )}
            {links.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <input
                    value={link.label}
                    onChange={e => updateLink(i, 'label', e.target.value)}
                    placeholder="Label (e.g. Bocconi Admissions)"
                    style={{ ...FORM_INPUT, fontSize: '0.68rem', padding: '0.375rem 0.625rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                    <input
                      value={link.url}
                      onChange={e => updateLink(i, 'url', e.target.value)}
                      placeholder="https://..."
                      style={{ ...FORM_INPUT, fontSize: '0.68rem', padding: '0.375rem 0.625rem', flex: 1 }}
                    />
                    {link.url && (
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: col, flexShrink: 0, display: 'flex', padding: '0.25rem' }}
                        onClick={e => e.stopPropagation()}>
                        <ExternalLink style={{ width: '13px', height: '13px' }} />
                      </a>
                    )}
                  </div>
                </div>
                <button onClick={() => removeLink(i)}
                  style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.25rem', flexShrink: 0, opacity: 0.6 }}>
                  <X style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
            ))}
            <button onClick={addLink}
              style={{ background: C.cardBg, border: `1.5px dashed ${C.border}`, color: C.muted, padding: '0.5rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
              <Plus style={{ width: '10px', height: '10px' }} /> Add Link
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', borderTop: `1.5px solid ${C.border}`, paddingTop: '0.875rem' }}>
          {onDelete && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)}
              style={{ ...BTN_BASE, background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.65rem 0.75rem' }}>
              <Trash2 style={{ width: '12px', height: '12px' }} />
            </button>
          )}
          {onDelete && confirmDelete && (
            <button onClick={onDelete} style={{ ...BTN_BASE, background: '#dc2626', color: '#fff', flex: 1 }}>
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
                onClick={() => { if (title.trim()) onSave({ title, desc, category, icon, progress, notes, links }) }}
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
    </div>
  )
}

export function PuzzleMap() {
  const [data, setData] = useSyncedState<PuzzleData>("puzzle_map_v1", DEFAULT_DATA)
  const [editingPiece, setEditingPiece] = useState<PuzzlePiece | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const pieces = data?.pieces ?? DEFAULT_PIECES
  const storedPositions = data?.positions ?? {}

  const total = pieces.length > 0 ? pieces.reduce((s, p) => s + p.progress, 0) / pieces.length : 0
  const doneCount = pieces.filter(p => p.progress === 100).length
  const allDone = pieces.length > 0 && doneCount === pieces.length

  // ── Drag state ───────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
    startCX: number
    startCY: number
    moved: boolean
  } | null>(null)
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null)

  function getPiecePos(id: string, idx: number) {
    if (dragPos?.id === id) return { x: dragPos.x, y: dragPos.y }
    return storedPositions[id] ?? defaultPos(idx)
  }

  function handlePiecePointerDown(e: React.PointerEvent, pieceId: string, pieceIdx: number) {
    e.preventDefault()
    e.stopPropagation()
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left + canvas.scrollLeft
    const cy = e.clientY - rect.top + canvas.scrollTop
    const pos = getPiecePos(pieceId, pieceIdx)
    dragRef.current = {
      id: pieceId,
      offsetX: cx - pos.x,
      offsetY: cy - pos.y,
      startCX: cx,
      startCY: cy,
      moved: false,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePiecePointerMove(e: React.PointerEvent) {
    const dr = dragRef.current
    if (!dr) return
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left + canvas.scrollLeft
    const cy = e.clientY - rect.top + canvas.scrollTop
    if (!dr.moved) {
      const d = Math.sqrt((cx - dr.startCX) ** 2 + (cy - dr.startCY) ** 2)
      if (d > 5) dr.moved = true
    }
    if (dr.moved) {
      setDragPos({ id: dr.id, x: Math.max(0, cx - dr.offsetX), y: Math.max(0, cy - dr.offsetY) })
    }
  }

  function handlePiecePointerUp(e: React.PointerEvent) {
    const dr = dragRef.current
    if (!dr) return
    if (!dr.moved) {
      const piece = pieces.find(p => p.id === dr.id)
      if (piece) setEditingPiece(piece)
    } else if (dragPos) {
      const { x, y } = dragPos
      setData(prev => ({
        ...prev!,
        positions: { ...(prev?.positions ?? {}), [dr.id]: { x, y } },
      }))
    }
    dragRef.current = null
    setDragPos(null)
  }

  function resetPositions() {
    setData(prev => ({ ...prev!, positions: {} }))
  }

  // ── Canvas dimensions ────────────────────────────────────────────────────
  const allPos = pieces.map((p, i) => getPiecePos(p.id, i))
  const innerW = Math.max(700, ...allPos.map(pos => pos.x + PIECE_W + 60))
  const innerH = Math.max(500, ...allPos.map(pos => pos.y + PIECE_H + 60))

  // ── Connection lines between completed pieces ────────────────────────────
  const connections: Array<{
    x1: number; y1: number; x2: number; y2: number
    col1: string; col2: string; id: string
  }> = []

  const completedPieces = pieces
    .map((p, i) => ({ piece: p, center: { x: getPiecePos(p.id, i).x + PIECE_W / 2, y: getPiecePos(p.id, i).y + PIECE_H / 2 } }))
    .filter(({ piece }) => piece.progress === 100)

  for (let i = 0; i < completedPieces.length; i++) {
    for (let j = i + 1; j < completedPieces.length; j++) {
      const a = completedPieces[i], b = completedPieces[j]
      const dist = Math.sqrt((b.center.x - a.center.x) ** 2 + (b.center.y - a.center.y) ** 2)
      if (dist < CONNECTION_DIST) {
        connections.push({
          x1: a.center.x, y1: a.center.y,
          x2: b.center.x, y2: b.center.y,
          col1: CAT_COLOR[a.piece.category],
          col2: CAT_COLOR[b.piece.category],
          id: `${a.piece.id}_${b.piece.id}`,
        })
      }
    }
  }

  // ── Data mutations ───────────────────────────────────────────────────────
  const savePiece = (id: string, fields: FormFields) => {
    setData(prev => ({
      ...prev!,
      pieces: (prev?.pieces ?? []).map(p =>
        p.id === id ? { ...p, title: fields.title, description: fields.desc, category: fields.category, icon: fields.icon, progress: fields.progress, notes: fields.notes, links: fields.links } : p
      ),
    }))
    setEditingPiece(null)
  }

  const deletePiece = (id: string) => {
    setData(prev => ({ ...prev!, pieces: (prev?.pieces ?? []).filter(p => p.id !== id) }))
    setEditingPiece(null)
  }

  const addPiece = (fields: FormFields) => {
    const piece: PuzzlePiece = {
      id: `piece_${Date.now()}`, title: fields.title, description: fields.desc,
      category: fields.category, progress: 0, icon: fields.icon || '🎯',
      notes: fields.notes || undefined,
      links: fields.links.length > 0 ? fields.links : undefined,
    }
    setData(prev => ({ ...prev!, pieces: [...(prev?.pieces ?? []), piece] }))
    setShowAdd(false)
  }

  const MODAL_WRAPPER: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  const MODAL_BOX: React.CSSProperties = {
    position: 'relative', background: C.bg, border: `1.5px solid ${C.border}`,
    width: '100%', maxWidth: '500px', margin: '1rem', maxHeight: '90vh', overflow: 'auto',
  }
  const MODAL_HEADER: React.CSSProperties = {
    padding: '0.875rem 1.25rem', borderBottom: `1.5px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, background: C.bg, zIndex: 1,
  }

  return (
    <div>
      {/* CSS for animated connection lines */}
      <style>{`
        @keyframes dashFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -36; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.53rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.1rem' }}>Pieces Connected</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: C.red, fontFamily: 'monospace', lineHeight: 1 }}>
              {doneCount}<span style={{ fontSize: '1rem', color: C.muted }}>/{pieces.length}</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.53rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: '0.1rem' }}>Final Goal Resolution</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: C.fg, fontFamily: 'monospace', lineHeight: 1 }}>
              {total.toFixed(0)}<span style={{ fontSize: '1rem', color: C.muted }}>%</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={resetPositions}
            style={{ background: 'transparent', border: `1.5px solid ${C.border}`, color: C.muted, padding: '0.4rem 0.6rem', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Reset piece positions to grid"
          >
            <LayoutGrid style={{ width: '11px', height: '11px' }} /> Reset Layout
          </button>
          <button
            onClick={() => setShowAdd(true)}
            style={{ background: C.red, border: `1.5px solid ${C.red}`, color: '#000', padding: '0.4rem 0.75rem', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus style={{ width: '11px', height: '11px' }} /> Add Piece
          </button>
        </div>
      </div>

      {/* Master progress bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ height: '5px', background: C.cardBg, border: `1px solid ${C.border}` }}>
          <div style={{ height: '100%', width: `${total}%`, background: `linear-gradient(90deg, ${C.red}, #f59e0b)`, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* All-complete banner */}
      {allDone && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(192,120,64,0.15)', border: `1.5px solid ${C.red}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: C.red, letterSpacing: '0.08em' }}>PUZZLE COMPLETE — ALL PIECES CONNECTED</p>
            <p style={{ fontSize: '0.58rem', color: C.muted, marginTop: '0.15rem' }}>Every goal has been achieved. The full picture is realized.</p>
          </div>
        </div>
      )}

      {/* Drag hint */}
      <p style={{ fontSize: '0.55rem', color: C.muted, marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
        Drag pieces freely · Pieces at 100% glow and connect when nearby · Click to edit
      </p>

      {/* Puzzle Canvas */}
      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '620px',
          overflow: 'auto',
          border: `1.5px solid ${C.border}`,
          background: C.bg,
          marginBottom: '2rem',
        }}
      >
        <div style={{ position: 'relative', width: innerW, height: innerH, minWidth: '100%' }}>

          {/* SVG overlay for connection lines */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
          >
            <defs>
              {connections.map(c => (
                <linearGradient
                  key={`g_${c.id}`} id={`cg_${c.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                >
                  <stop offset="0%" stopColor={c.col1} />
                  <stop offset="100%" stopColor={c.col2} />
                </linearGradient>
              ))}
              <filter id="conn_glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connections.map(c => (
              <g key={c.id}>
                {/* Pulsing glow backdrop */}
                <line
                  x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                  stroke={`url(#cg_${c.id})`}
                  strokeWidth="14"
                  filter="url(#conn_glow)"
                  style={{ animation: 'pulseGlow 2.5s ease-in-out infinite' }}
                />
                {/* Animated dashed line */}
                <line
                  x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                  stroke={`url(#cg_${c.id})`}
                  strokeWidth="2"
                  opacity="0.9"
                  strokeDasharray="12 6"
                  style={{ animation: 'dashFlow 1.2s linear infinite' }}
                />
                {/* End nodes */}
                <circle cx={c.x1} cy={c.y1} r="6" fill={c.col1} opacity="0.9" filter="url(#conn_glow)" />
                <circle cx={c.x2} cy={c.y2} r="6" fill={c.col2} opacity="0.9" filter="url(#conn_glow)" />
                <circle cx={c.x1} cy={c.y1} r="3" fill={c.col1} />
                <circle cx={c.x2} cy={c.y2} r="3" fill={c.col2} />
              </g>
            ))}
          </svg>

          {/* Puzzle pieces */}
          {pieces.map((piece, i) => {
            const pos = getPiecePos(piece.id, i)
            const isBeingDragged = dragRef.current?.id === piece.id && dragRef.current.moved

            return (
              <div
                key={piece.id}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: PIECE_W,
                  cursor: isBeingDragged ? 'grabbing' : 'grab',
                  userSelect: 'none' as const,
                  zIndex: isBeingDragged ? 100 : (piece.progress === 100 ? 4 : 1),
                  filter: isBeingDragged
                    ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))'
                    : piece.progress === 100
                      ? `drop-shadow(0 0 8px ${CAT_COLOR[piece.category]}88)`
                      : undefined,
                  transition: isBeingDragged ? 'none' : 'filter 0.4s, left 0.05s, top 0.05s',
                  touchAction: 'none',
                  transform: isBeingDragged ? 'scale(1.06)' : undefined,
                }}
                onPointerDown={(e) => handlePiecePointerDown(e, piece.id, i)}
                onPointerMove={handlePiecePointerMove}
                onPointerUp={handlePiecePointerUp}
              >
                <PieceVisual piece={piece} isDragging={isBeingDragged} />
              </div>
            )
          })}
        </div>
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
        <div style={MODAL_WRAPPER}>
          <div onClick={() => setEditingPiece(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={MODAL_BOX}>
            <div style={MODAL_HEADER}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>{editingPiece.icon}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>{editingPiece.title}</span>
              </div>
              <button onClick={() => setEditingPiece(null)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
            <PieceForm
              initial={{
                title: editingPiece.title, desc: editingPiece.description,
                category: editingPiece.category, icon: editingPiece.icon,
                progress: editingPiece.progress,
                notes: editingPiece.notes ?? '',
                links: editingPiece.links ?? [],
              }}
              onSave={(fields) => savePiece(editingPiece.id, fields)}
              onCancel={() => setEditingPiece(null)}
              onDelete={() => deletePiece(editingPiece.id)}
            />
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={MODAL_WRAPPER}>
          <div onClick={() => setShowAdd(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={MODAL_BOX}>
            <div style={MODAL_HEADER}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>New Puzzle Piece</span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '0.2rem', display: 'flex' }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
            <PieceForm
              initial={{ title: '', desc: '', category: 'academic', icon: '🎯', progress: 0, notes: '', links: [] }}
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
