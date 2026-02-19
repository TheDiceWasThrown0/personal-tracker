"use client"

import { useSyncedState } from "@/hooks/useSyncedState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trash2, Plus, BookOpen, Code2, Trophy, Check, X, Star, GraduationCap } from "lucide-react"
import { useState, useEffect } from "react"

// --- Types ---
interface Skill {
    id: number
    name: string
    level: number // 0-100
    hours: number
    targetHours: number
}

interface Book {
    id: number
    title: string
    author: string
    status: "Reading" | "Read" | "To Read"
    rating: number // 0-5
}

interface Project {
    id: number
    name: string
    description: string
    status: "Active" | "Completed" | "Planned"
    tech: string
}

interface Course {
    id: number
    name: string
    credits: number
    grade: number
}

// --- Initial Data ---
const initialSkills: Skill[] = [
    { id: 1, name: "Financial Modeling", level: 45, hours: 120, targetHours: 1000 },
    { id: 2, name: "Python / Quant Trading", level: 30, hours: 85, targetHours: 500 },
    { id: 3, name: "Italian Language", level: 10, hours: 25, targetHours: 300 },
]

const initialBooks: Book[] = [
    { id: 1, title: "A Random Walk Down Wall Street", author: "Burton Malkiel", status: "Reading", rating: 0 },
    { id: 2, title: "Principles", author: "Ray Dalio", status: "To Read", rating: 0 },
    { id: 3, title: "Atomic Habits", author: "James Clear", status: "Read", rating: 5 },
]

const initialProjects: Project[] = [
    { id: 1, name: "Billionaire Roadmap Tracker", description: "Next.js dashboard for life goals", status: "Active", tech: "Next.js, Tailwind" },
    { id: 2, name: "Algorithmic Trading Bot", description: "Simple mean reversion strategy", status: "Planned", tech: "Python, Pandas" },
]

export function SkillAcademiaTracker() {
    // Persistent State
    const [skills, setSkills] = useSyncedState<Skill[]>("mastery_skills", initialSkills)
    const [books, setBooks] = useSyncedState<Book[]>("mastery_books", initialBooks)
    const [projects, setProjects] = useSyncedState<Project[]>("mastery_projects", initialProjects)

    // Editing State
    const [editingSection, setEditingSection] = useState<string | null>(null)

    // Temp State for Editing
    const [tempSkills, setTempSkills] = useState(skills)
    const [tempBooks, setTempBooks] = useState(books)
    const [tempProjects, setTempProjects] = useState(projects)

    // --- Handlers ---
    const startEditing = (section: string) => {
        if (editingSection) return // Only edit one at a time for simplicity
        setEditingSection(section)
        setTempSkills(skills)
        setTempBooks(books)
        setTempProjects(projects)
    }

    const saveEditing = () => {
        if (editingSection === 'skills') setSkills(tempSkills)
        if (editingSection === 'books') setBooks(tempBooks)
        if (editingSection === 'projects') setProjects(tempProjects)
        setEditingSection(null)
    }

    const cancelEditing = () => {
        setEditingSection(null)
    }

    // --- Helpers for Temp State Updates ---
    const updateSkill = (index: number, field: keyof Skill, val: any) => {
        const newSkills = [...tempSkills]
        newSkills[index] = { ...newSkills[index], [field]: val }
        setTempSkills(newSkills)
    }

    const updateBook = (index: number, field: keyof Book, val: any) => {
        const newBooks = [...tempBooks]
        newBooks[index] = { ...newBooks[index], [field]: val }
        setTempBooks(newBooks)
    }

    const updateProject = (index: number, field: keyof Project, val: any) => {
        const newProjs = [...tempProjects]
        newProjs[index] = { ...newProjs[index], [field]: val }
        setTempProjects(newProjs)
    }

    const addItem = (type: 'skill' | 'book' | 'project') => {
        if (type === 'skill') setTempSkills([...tempSkills, { id: Date.now(), name: "New Skill", level: 0, hours: 0, targetHours: 100 }])
        if (type === 'book') setTempBooks([...tempBooks, { id: Date.now(), title: "New Book", author: "Author", status: "To Read", rating: 0 }])
        if (type === 'project') setTempProjects([...tempProjects, { id: Date.now(), name: "New Project", description: "Description", status: "Planned", tech: "Tags" }])
    }

    const removeItem = (type: 'skill' | 'book' | 'project', index: number) => {
        if (type === 'skill') setTempSkills(tempSkills.filter((_, i) => i !== index))
        if (type === 'book') setTempBooks(tempBooks.filter((_, i) => i !== index))
        if (type === 'project') setTempProjects(tempProjects.filter((_, i) => i !== index))
    }

    // --- GPA Logic ---
    const [courses, setCourses] = useSyncedState<Course[]>("mastery_courses", [
        { id: 1, name: "Macroeconomics", credits: 4, grade: 4.0 },
        { id: 2, name: "Corporate Finance", credits: 4, grade: 3.7 },
        { id: 3, name: "Business Law", credits: 2, grade: 3.3 },
    ])
    // Sync to Dashboard
    const [, setDashboardGPA] = useSyncedState<number>("shijun-gpa", 0)

    const [tempCourses, setTempCourses] = useState(courses)

    // Calculate GPA whenever courses change
    useEffect(() => {
        if (courses.length === 0) return
        const totalPoints = courses.reduce((acc, course) => acc + (course.grade * course.credits), 0)
        const totalCredits = courses.reduce((acc, course) => acc + course.credits, 0)
        const weightedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0.0
        setDashboardGPA(weightedGPA)
    }, [courses, setDashboardGPA])


    // Handlers for GPA
    const startEditingGPA = () => {
        if (editingSection) return
        setEditingSection('gpa')
        setTempCourses(courses)
    }

    const saveGPA = () => {
        setCourses(tempCourses)
        setEditingSection(null)
    }

    const updateCourse = (index: number, field: keyof Course, val: any) => {
        const newCourses = [...tempCourses]
        newCourses[index] = { ...newCourses[index], [field]: val }
        setTempCourses(newCourses)
    }

    const removeCourse = (index: number) => {
        setTempCourses(tempCourses.filter((_, i) => i !== index))
    }

    const addCourse = () => {
        setTempCourses([...tempCourses, { id: Date.now(), name: "New Course", credits: 3, grade: 4.0 }])
    }

    // Calculate current display GPA
    const currentGPA = (() => {
        const list = editingSection === 'gpa' ? tempCourses : courses
        if (list.length === 0) return 0.0
        const totalPoints = list.reduce((acc, course) => acc + (course.grade * course.credits), 0)
        const totalCredits = list.reduce((acc, course) => acc + course.credits, 0)
        return totalCredits > 0 ? totalPoints / totalCredits : 0.0
    })()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

            {/* 1. Skill Stack */}
            <Card
                onClick={() => !editingSection && startEditing('skills')}
                className={`lg:col-span-1 border-4 border-emerald-500/20 bg-stone-900/50 backdrop-blur-md shadow-xl overflow-hidden relative group transition-all ${!editingSection && 'hover:-translate-y-1 hover:border-emerald-500/50 cursor-pointer'}`}
            >
                <CardHeader className="bg-emerald-900/20 pb-4 border-b border-emerald-500/10">
                    <CardTitle className="text-emerald-400 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Skill Mastery
                    </CardTitle>
                    {editingSection === 'skills' && (
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); saveEditing() }} className="p-1 bg-emerald-500 text-white rounded-full hover:scale-110"><Check className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); cancelEditing() }} className="p-1 bg-red-500 text-white rounded-full hover:scale-110"><X className="w-4 h-4" /></button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {(editingSection === 'skills' ? tempSkills : skills).map((skill, i) => (
                        <div key={skill.id} className="space-y-2">
                            <div className="flex justify-between items-end">
                                {editingSection === 'skills' ? (
                                    <input
                                        value={skill.name}
                                        onChange={(e) => updateSkill(i, 'name', e.target.value)}
                                        className="bg-black/30 text-emerald-100 font-bold text-sm rounded px-1 w-full mr-2 border border-emerald-500/30"
                                    />
                                ) : (
                                    <span className="font-bold text-emerald-100 text-sm">{skill.name}</span>
                                )}

                                <span className="text-xs font-mono text-emerald-400/80">
                                    {editingSection === 'skills' ? (
                                        <div className="flex items-center gap-1">
                                            <input type="number" value={skill.hours} onChange={(e) => updateSkill(i, 'hours', Number(e.target.value))} className="w-12 bg-black/30 border border-emerald-500/30 rounded px-1 text-right" />
                                            <span>/</span>
                                            <input type="number" value={skill.targetHours} onChange={(e) => updateSkill(i, 'targetHours', Number(e.target.value))} className="w-12 bg-black/30 border border-emerald-500/30 rounded px-1" />
                                            <button onClick={() => removeItem('skill', i)} className="text-red-400 ml-1"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        `${skill.hours}h / ${skill.targetHours}h`
                                    )}
                                </span>
                            </div>
                            {editingSection !== 'skills' && (
                                <Progress value={(skill.hours / skill.targetHours) * 100} className="h-2 bg-emerald-900/30" />
                            )}
                        </div>
                    ))}
                    {editingSection === 'skills' && (
                        <button onClick={() => addItem('skill')} className="w-full py-2 border border-dashed border-emerald-500/30 text-emerald-400 text-xs font-bold rounded hover:bg-emerald-900/20">+ Add Skill</button>
                    )}
                </CardContent>
            </Card>

            {/* 2. Reading List */}
            <Card
                onClick={() => !editingSection && startEditing('books')}
                className={`lg:col-span-1 border-4 border-amber-500/20 bg-stone-900/50 backdrop-blur-md shadow-xl overflow-hidden relative group transition-all ${!editingSection && 'hover:-translate-y-1 hover:border-amber-500/50 cursor-pointer'}`}
            >
                <CardHeader className="bg-amber-900/20 pb-4 border-b border-amber-500/10">
                    <CardTitle className="text-amber-400 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Reading List
                    </CardTitle>
                    {editingSection === 'books' && (
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); saveEditing() }} className="p-1 bg-amber-500 text-white rounded-full hover:scale-110"><Check className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); cancelEditing() }} className="p-1 bg-red-500 text-white rounded-full hover:scale-110"><X className="w-4 h-4" /></button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="pt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {(editingSection === 'books' ? tempBooks : books).map((book, i) => (
                        <div key={book.id} className="bg-stone-800/50 p-3 rounded-lg border border-stone-700/50">
                            <div className="flex justify-between items-start mb-1">
                                {editingSection === 'books' ? (
                                    <div className="w-full space-y-1">
                                        <input value={book.title} onChange={(e) => updateBook(i, 'title', e.target.value)} className="w-full bg-black/30 text-amber-100 text-sm font-bold rounded px-1 border border-amber-500/30" placeholder="Title" />
                                        <input value={book.author} onChange={(e) => updateBook(i, 'author', e.target.value)} className="w-full bg-black/30 text-amber-100/60 text-xs rounded px-1 border border-amber-500/30" placeholder="Author" />
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="text-amber-100 font-bold text-sm leading-tight">{book.title}</h4>
                                        <p className="text-amber-100/60 text-xs">{book.author}</p>
                                    </div>
                                )}
                                {editingSection === 'books' && (
                                    <button onClick={() => removeItem('book', i)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                {editingSection === 'books' ? (
                                    <select value={book.status} onChange={(e) => updateBook(i, 'status', e.target.value)} className="bg-black/30 text-xs text-amber-200 border border-amber-500/30 rounded">
                                        <option value="Reading">Reading</option>
                                        <option value="To Read">To Read</option>
                                        <option value="Read">Read</option>
                                    </select>
                                ) : (
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${book.status === 'Reading' ? 'bg-amber-500/20 text-amber-400' :
                                        book.status === 'Read' ? 'bg-green-500/20 text-green-400' : 'bg-stone-700 text-stone-400'
                                        }`}>
                                        {book.status}
                                    </span>
                                )}

                                <div className="flex text-amber-500">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            className={`w-3 h-3 ${star <= book.rating ? 'fill-current' : 'text-stone-600'} ${editingSection === 'books' ? 'cursor-pointer' : ''}`}
                                            onClick={(e) => {
                                                if (editingSection === 'books') {
                                                    e.stopPropagation()
                                                    updateBook(i, 'rating', star)
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {editingSection === 'books' && (
                        <button onClick={() => addItem('book')} className="w-full py-2 border border-dashed border-amber-500/30 text-amber-400 text-xs font-bold rounded hover:bg-amber-900/20">+ Add Book</button>
                    )}
                </CardContent>
            </Card>

            {/* 3. GPA Calculator (New) */}
            <Card
                onClick={() => !editingSection && startEditingGPA()}
                className={`lg:col-span-1 border-4 border-blue-500/20 bg-stone-900/50 backdrop-blur-md shadow-xl overflow-hidden relative group transition-all ${!editingSection && 'hover:-translate-y-1 hover:border-blue-500/50 cursor-pointer'}`}
            >
                <CardHeader className="bg-blue-900/20 pb-4 border-b border-blue-500/10">
                    <CardTitle className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> GPA Calculator
                        </div>
                        <span className="text-xl text-white">{currentGPA.toFixed(2)}</span>
                    </CardTitle>
                    {editingSection === 'gpa' && (
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); saveGPA() }} className="p-1 bg-blue-500 text-white rounded-full hover:scale-110"><Check className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); cancelEditing() }} className="p-1 bg-red-500 text-white rounded-full hover:scale-110"><X className="w-4 h-4" /></button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    <div className="grid grid-cols-12 text-[10px] text-stone-500 uppercase font-bold pl-2">
                        <div className="col-span-6">Course</div>
                        <div className="col-span-2 text-center">Cr</div>
                        <div className="col-span-2 text-center">Gr</div>
                    </div>
                    {(editingSection === 'gpa' ? tempCourses : courses).map((course, i) => (
                        <div key={course.id} className="grid grid-cols-12 gap-2 items-center bg-stone-800/30 p-2 rounded">
                            <div className="col-span-6">
                                {editingSection === 'gpa' ? (
                                    <input value={course.name} onChange={(e) => updateCourse(i, 'name', e.target.value)} className="w-full bg-black/30 text-blue-100 text-xs font-bold rounded px-1 border border-blue-500/30" />
                                ) : (
                                    <span className="text-blue-100 font-bold text-xs truncate block">{course.name}</span>
                                )}
                            </div>
                            <div className="col-span-2 text-center">
                                {editingSection === 'gpa' ? (
                                    <input type="number" value={course.credits} onChange={(e) => updateCourse(i, 'credits', Number(e.target.value))} className="w-full bg-black/30 text-blue-200 text-xs text-center rounded px-1 border border-blue-500/30" />
                                ) : (
                                    <span className="text-stone-400 text-xs">{course.credits}</span>
                                )}
                            </div>
                            <div className="col-span-2 text-center">
                                {editingSection === 'gpa' ? (
                                    <input type="number" step="0.1" value={course.grade} onChange={(e) => updateCourse(i, 'grade', Number(e.target.value))} className="w-full bg-black/30 text-white text-xs font-bold text-center rounded px-1 border border-blue-500/30" />
                                ) : (
                                    <span className={`text-xs font-bold ${course.grade >= 4.0 ? 'text-emerald-400' : 'text-blue-200'}`}>{course.grade.toFixed(1)}</span>
                                )}
                            </div>
                            <div className="col-span-2 flex justify-end">
                                {editingSection === 'gpa' && (
                                    <button onClick={() => removeCourse(i)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    {editingSection === 'gpa' && (
                        <button onClick={addCourse} className="w-full py-2 border border-dashed border-blue-500/30 text-blue-400 text-xs font-bold rounded hover:bg-blue-900/20">+ Add Course</button>
                    )}
                </CardContent>
            </Card>

            {/* 4. Project Portfolio */}
            <Card
                onClick={() => !editingSection && startEditing('projects')}
                className={`lg:col-span-3 border-4 border-cyan-500/20 bg-stone-900/50 backdrop-blur-md shadow-xl overflow-hidden relative group transition-all ${!editingSection && 'hover:-translate-y-1 hover:border-cyan-500/50 cursor-pointer'}`}
            >
                <CardHeader className="bg-cyan-900/20 pb-4 border-b border-cyan-500/10">
                    <CardTitle className="text-cyan-400 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> Portfolio
                    </CardTitle>
                    {editingSection === 'projects' && (
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); saveEditing() }} className="p-1 bg-cyan-500 text-white rounded-full hover:scale-110"><Check className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); cancelEditing() }} className="p-1 bg-red-500 text-white rounded-full hover:scale-110"><X className="w-4 h-4" /></button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {(editingSection === 'projects' ? tempProjects : projects).map((project, i) => (
                        <div key={project.id} className="relative pl-4 border-l-2 border-cyan-700/50">
                            {editingSection === 'projects' ? (
                                <div className="space-y-2">
                                    <input value={project.name} onChange={(e) => updateProject(i, 'name', e.target.value)} className="w-full bg-black/30 text-cyan-100 font-bold text-sm rounded px-1 border border-cyan-500/30" placeholder="Project Name" />
                                    <input value={project.description} onChange={(e) => updateProject(i, 'description', e.target.value)} className="w-full bg-black/30 text-cyan-100/60 text-xs rounded px-1 border border-cyan-500/30" placeholder="Description" />
                                    <input value={project.tech} onChange={(e) => updateProject(i, 'tech', e.target.value)} className="w-full bg-black/30 text-cyan-400 text-xs font-mono rounded px-1 border border-cyan-500/30" placeholder="Tech Stack" />
                                    <div className="flex justify-between items-center">
                                        <select value={project.status} onChange={(e) => updateProject(i, 'status', e.target.value)} className="bg-black/30 text-xs text-cyan-200 border border-cyan-500/30 rounded">
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Planned">Planned</option>
                                        </select>
                                        <button onClick={() => removeItem('project', i)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-cyan-100 font-bold text-sm">{project.name}</h4>
                                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${project.status === 'Active' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                                            project.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-stone-700 text-stone-400'
                                            }`}>{project.status}</span>
                                    </div>
                                    <p className="text-stone-400 text-xs mb-2 line-clamp-2">{project.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {project.tech.split(',').map((tag, t) => (
                                            <span key={t} className="text-[10px] font-mono text-cyan-600 bg-cyan-950/30 px-1 rounded border border-cyan-900/50">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {editingSection === 'projects' && (
                        <button onClick={() => addItem('project')} className="w-full py-2 border border-dashed border-cyan-500/30 text-cyan-400 text-xs font-bold rounded hover:bg-cyan-900/20">+ Add Project</button>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}
