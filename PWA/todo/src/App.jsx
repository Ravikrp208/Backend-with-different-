import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus, Trash2, Edit2, Check, Calendar, Clock, Search, Briefcase, User, Activity, CreditCard,
  Settings, Sun, Moon, Download, WifiOff, Star, X, ChevronDown, ChevronUp, PieChart, List,
  CheckCircle, PlusCircle, CloudRain, Trees, Volume2, Play, Pause, RotateCcw, Archive, FolderPlus,
  Heart, Book, FileText, Flame, Award, Hourglass, BarChart3, ChevronLeft, Upload, Info
} from 'lucide-react'
import { triggerConfetti } from './utils/confetti'
import { playRain, stopRain, playWhiteNoise, stopWhiteNoise, playForest, stopForest } from './utils/audio'

// Predefined default categories
const defaultCategories = [
  { id: 'work', name: 'Work', icon: 'Briefcase', colorRgb: '139, 92, 246', colorHex: '#8b5cf6' }, // Purple
  { id: 'personal', name: 'Personal', icon: 'User', colorRgb: '236, 72, 153', colorHex: '#ec4899' }, // Pink
  { id: 'health', name: 'Health', icon: 'Activity', colorRgb: '16, 185, 129', colorHex: '#10b981' }, // Green
  { id: 'finance', name: 'Finance', icon: 'CreditCard', colorRgb: '245, 158, 11', colorHex: '#f59e0b' } // Orange
]

// Icon mapping helper
const iconMapping = {
  Briefcase, User, Activity, CreditCard, Star, Book, Heart, FileText, Info
}

const App = () => {
  // --- STATE ---
  // PWA Landing Splash Screen gate state
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('pwa_todo_has_started') === 'true'
  })

  // Accent color customization
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('pwa_todo_accent') || 'purple'
  })

  // Custom categories list
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('pwa_todo_custom_categories')
    return saved ? JSON.parse(saved) : []
  })

  // Active tasks list
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('pwa_todo_tasks')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return [
      {
        id: '1',
        title: 'Design Premium ZenTodo PWA UI',
        desc: 'Implement responsive glassmorphic layouts, custom timers, and interactive sound generators.',
        category: 'work',
        priority: 'high',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '12:00',
        completed: false,
        pinned: true,
        subtasks: [
          { id: 'sub-1', title: 'Write responsive CSS system', completed: true },
          { id: 'sub-2', title: 'Implement React application states', completed: false },
          { id: 'sub-3', title: 'Configure Web Audio Ambient Synthesizer', completed: false }
        ]
      },
      {
        id: '2',
        title: 'Weekly Zen Meditation Schedule',
        desc: 'Practice 20 minutes of mindful breathing and focus restoration.',
        category: 'personal',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        dueTime: '08:00',
        completed: false,
        pinned: false,
        subtasks: []
      },
      {
        id: '3',
        title: 'Run 5km Trails',
        desc: 'Cardio endurance and posture training in the park.',
        category: 'health',
        priority: 'low',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '17:30',
        completed: true,
        pinned: false,
        subtasks: []
      }
    ]
  })

  // Archived tasks list
  const [archivedTasks, setArchivedTasks] = useState(() => {
    const saved = localStorage.getItem('pwa_todo_archived_tasks')
    return saved ? JSON.parse(saved) : []
  })

  // Focus Mode Pomodoro Timer state
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500) // 25 mins in seconds
  const [focusTimerActive, setFocusTimerActive] = useState(false)
  const [focusTask, setFocusTask] = useState('none')
  const [focusTotalSeconds, setFocusTotalSeconds] = useState(() => {
    return parseInt(localStorage.getItem('pwa_todo_focus_seconds') || '0', 10)
  })

  // Ambient sound play states
  const [ambientRain, setAmbientRain] = useState(false)
  const [ambientForest, setAmbientForest] = useState(false)
  const [ambientNoise, setAmbientNoise] = useState(false)

  // App Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pwa_todo_theme') || 'dark'
  })

  // Active Screen / Tab
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'focus' | 'stats' | 'settings' | 'archive'

  // Filtering / Search
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'today' | 'upcoming' | 'completed'

  // Inline Expandable Task
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // Dedicated Detailed Modal View (Subtask Manager detail view)
  const [detailModalTask, setDetailModalTask] = useState(null)

  // PWA install states
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Task Creator / Editor inputs
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('work')
  const [formPriority, setFormPriority] = useState('medium')
  const [formDueDate, setFormDueDate] = useState('')
  const [formDueTime, setFormDueTime] = useState('')
  const [formSubtasks, setFormSubtasks] = useState([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // Custom Category Builder inputs
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#8b5cf6')
  const [newCatIcon, setNewCatIcon] = useState('Briefcase')

  // --- DERIVED STATE ---
  const CATEGORIES = useMemo(() => {
    return [...defaultCategories, ...customCategories]
  }, [customCategories])

  // --- EFFECTS ---
  // Sync tasks
  useEffect(() => {
    localStorage.setItem('pwa_todo_tasks', JSON.stringify(tasks))
  }, [tasks])

  // Sync archived tasks
  useEffect(() => {
    localStorage.setItem('pwa_todo_archived_tasks', JSON.stringify(archivedTasks))
  }, [archivedTasks])

  // Sync custom categories
  useEffect(() => {
    localStorage.setItem('pwa_todo_custom_categories', JSON.stringify(customCategories))
  }, [customCategories])

  // Sync theme attribute
  useEffect(() => {
    localStorage.setItem('pwa_todo_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Sync hasStarted state
  useEffect(() => {
    localStorage.setItem('pwa_todo_has_started', hasStarted ? 'true' : 'false')
  }, [hasStarted])

  // Sync accent color values dynamically to CSS root variables
  useEffect(() => {
    localStorage.setItem('pwa_todo_accent', accentColor)
    const root = document.documentElement
    const colorPresets = {
      purple: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' },
      blue: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
      pink: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
      orange: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
      teal: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }
    }
    const current = colorPresets[accentColor] || colorPresets.purple
    root.style.setProperty('--primary', current.primary)
    root.style.setProperty('--primary-glow', current.glow)
    root.style.setProperty('--primary-gradient', current.gradient)
  }, [accentColor])

  // Focus Pomodoro Timer countdown interval
  useEffect(() => {
    let interval = null
    if (focusTimerActive && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft(prev => prev - 1)
        setFocusTotalSeconds(prev => prev + 1)
      }, 1000)
    } else if (focusTimeLeft === 0) {
      setFocusTimerActive(false)
      triggerConfetti()
      // If timer is connected to a specific task, complete it!
      if (focusTask !== 'none') {
        setTasks(prev => prev.map(t => t.id === focusTask ? { ...t, completed: true } : t))
      }
      alert('Focus session complete! Take a deep breath.')
      setFocusTimeLeft(1500)
    }
    return () => clearInterval(interval)
  }, [focusTimerActive, focusTimeLeft, focusTask])

  // Sync Focus Hours
  useEffect(() => {
    localStorage.setItem('pwa_todo_focus_seconds', focusTotalSeconds.toString())
  }, [focusTotalSeconds])

  // Clean up sounds when leaving Focus Tab
  useEffect(() => {
    if (activeTab !== 'focus') {
      stopRain()
      stopForest()
      stopWhiteNoise()
      setAmbientRain(false)
      setAmbientForest(false)
      setAmbientNoise(false)
    }
  }, [activeTab])

  // Network connection monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // PWA install prompt handler
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  // --- LOGIC FUNCTIONS ---
  // PWA Install prompt trigger
  const handleInstallApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  // Open task sheet for adding
  const handleOpenAddForm = () => {
    setEditingTask(null)
    setFormTitle('')
    setFormDesc('')
    setFormCategory(CATEGORIES[0]?.id || 'work')
    setFormPriority('medium')
    setFormDueDate(new Date().toISOString().split('T')[0])
    setFormDueTime('12:00')
    setFormSubtasks([])
    setNewSubtaskTitle('')
    setIsFormOpen(true)
  }

  // Open task sheet for editing
  const handleOpenEditForm = (task, e) => {
    if (e) e.stopPropagation()
    setEditingTask(task)
    setFormTitle(task.title)
    setFormDesc(task.desc || '')
    setFormCategory(task.category)
    setFormPriority(task.priority)
    setFormDueDate(task.dueDate || '')
    setFormDueTime(task.dueTime || '')
    setFormSubtasks([...task.subtasks])
    setNewSubtaskTitle('')
    setIsFormOpen(true)
  }

  // Add subtask inside form
  const handleAddSubtaskInForm = () => {
    if (!newSubtaskTitle.trim()) return
    setFormSubtasks([
      ...formSubtasks,
      { id: 'sub-' + Date.now(), title: newSubtaskTitle.trim(), completed: false }
    ])
    setNewSubtaskTitle('')
  }

  // Remove subtask inside form
  const handleRemoveSubtaskInForm = (subId) => {
    setFormSubtasks(formSubtasks.filter(s => s.id !== subId))
  }

  // Save Task (Submit form)
  const handleSaveTask = (e) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    if (editingTask) {
      // Edit
      const updated = tasks.map(t => {
        if (t.id === editingTask.id) {
          const uTask = {
            ...t,
            title: formTitle.trim(),
            desc: formDesc.trim(),
            category: formCategory,
            priority: formPriority,
            dueDate: formDueDate,
            dueTime: formDueTime,
            subtasks: formSubtasks
          }
          // If modal details are open for this task, sync the details view
          if (detailModalTask && detailModalTask.id === t.id) {
            setDetailModalTask(uTask)
          }
          return uTask
        }
        return t
      })
      setTasks(updated)
    } else {
      // Add
      const newTask = {
        id: 'task-' + Date.now(),
        title: formTitle.trim(),
        desc: formDesc.trim(),
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        completed: false,
        pinned: false,
        subtasks: formSubtasks
      }
      setTasks([newTask, ...tasks])
    }

    setIsFormOpen(false)
    setEditingTask(null)
  }

  // Toggle Task Completion
  const handleToggleTask = (id, e) => {
    if (e) e.stopPropagation()
    let becameCompleted = false
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed
        if (nextCompleted) becameCompleted = true
        const updatedSubtasks = t.subtasks.map(sub => ({
          ...sub,
          completed: nextCompleted ? true : sub.completed
        }))
        const uTask = { ...t, completed: nextCompleted, subtasks: updatedSubtasks }
        if (detailModalTask && detailModalTask.id === t.id) {
          setDetailModalTask(uTask)
        }
        return uTask
      }
      return t
    })
    setTasks(updated)
    if (becameCompleted) {
      triggerConfetti()
    }
  }

  // Toggle subtasks checklist inside View / Detail
  const handleToggleSubtask = (taskId, subtaskId, e) => {
    if (e) e.stopPropagation()
    let becameCompleted = false
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(sub => {
          if (sub.id === subtaskId) {
            return { ...sub, completed: !sub.completed }
          }
          return sub
        })
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed)
        const nextCompleted = allCompleted ? true : t.completed
        if (nextCompleted && !t.completed) becameCompleted = true
        
        const uTask = {
          ...t,
          subtasks: updatedSubtasks,
          completed: nextCompleted
        }
        if (detailModalTask && detailModalTask.id === t.id) {
          setDetailModalTask(uTask)
        }
        return uTask
      }
      return t
    })
    setTasks(updated)
    if (becameCompleted) {
      triggerConfetti()
    }
  }

  // Add inline subtask from Detailed Modal
  const handleAddInlineSubtask = (taskId, title) => {
    if (!title.trim()) return
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const uTask = {
          ...t,
          subtasks: [...t.subtasks, { id: 'sub-' + Date.now(), title: title.trim(), completed: false }]
        }
        setDetailModalTask(uTask)
        return uTask
      }
      return t
    })
    setTasks(updated)
  }

  // Toggle Pin Task
  const handleTogglePin = (id, e) => {
    if (e) e.stopPropagation()
    const updated = tasks.map(t => {
      if (t.id === id) {
        const uTask = { ...t, pinned: !t.pinned }
        if (detailModalTask && detailModalTask.id === t.id) {
          setDetailModalTask(uTask)
        }
        return uTask
      }
      return t
    })
    setTasks(updated)
  }

  // Archive Task (Moves to archive array)
  const handleArchiveTask = (id, e) => {
    if (e) e.stopPropagation()
    const taskToArchive = tasks.find(t => t.id === id)
    if (!taskToArchive) return

    setArchivedTasks([taskToArchive, ...archivedTasks])
    setTasks(tasks.filter(t => t.id !== id))
    
    if (expandedTaskId === id) setExpandedTaskId(null)
    if (detailModalTask && detailModalTask.id === id) setDetailModalTask(null)
  }

  // Restore task from Archive
  const handleRestoreTask = (id) => {
    const taskToRestore = archivedTasks.find(t => t.id === id)
    if (!taskToRestore) return

    setTasks([taskToRestore, ...tasks])
    setArchivedTasks(archivedTasks.filter(t => t.id !== id))
  }

  // Delete Permanently from history
  const handlePermanentDelete = (id) => {
    if (confirm('Permanently delete this task from history? This cannot be undone.')) {
      setArchivedTasks(archivedTasks.filter(t => t.id !== id))
    }
  }

  // Reset/Clear completed tasks
  const handleClearCompleted = () => {
    if (confirm('Move all completed tasks to the Archive?')) {
      const completed = tasks.filter(t => t.completed)
      setArchivedTasks([...completed, ...archivedTasks])
      setTasks(tasks.filter(t => !t.completed))
    }
  }

  // Custom category creator submit
  const handleCreateCategory = (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '139, 92, 246'
    }

    const newCat = {
      id: 'custom-' + Date.now(),
      name: newCatName.trim(),
      icon: newCatIcon,
      colorRgb: hexToRgb(newCatColor),
      colorHex: newCatColor
    }

    setCustomCategories([...customCategories, newCat])
    setNewCatName('')
    setIsCategoryFormOpen(false)
  }

  // Delete Custom Category
  const handleDeleteCustomCategory = (catId) => {
    if (confirm('Delete this custom category? Associated tasks will remain but fallback to default styling.')) {
      setCustomCategories(customCategories.filter(c => c.id !== catId))
      if (selectedCategory === catId) setSelectedCategory('all')
    }
  }

  // Sound triggers Focus Mode
  const handleToggleSound = (type) => {
    if (type === 'rain') {
      if (ambientRain) {
        stopRain()
        setAmbientRain(false)
      } else {
        stopRain(); stopForest(); stopWhiteNoise()
        setAmbientRain(true); setAmbientForest(false); setAmbientNoise(false)
        playRain()
      }
    } else if (type === 'forest') {
      if (ambientForest) {
        stopForest()
        setAmbientForest(false)
      } else {
        stopRain(); stopForest(); stopWhiteNoise()
        setAmbientRain(false); setAmbientForest(true); setAmbientNoise(false)
        playForest()
      }
    } else if (type === 'noise') {
      if (ambientNoise) {
        stopWhiteNoise()
        setAmbientNoise(false)
      } else {
        stopRain(); stopForest(); stopWhiteNoise()
        setAmbientRain(false); setAmbientForest(false); setAmbientNoise(true)
        playWhiteNoise()
      }
    }
  }

  // Data Exporting / Importing
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ tasks, archivedTasks, customCategories, focusTotalSeconds }))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `zentodo-backup-${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleImportData = (e) => {
    const fileReader = new FileReader()
    if (e.target.files.length === 0) return
    fileReader.readAsText(e.target.files[0], 'UTF-8')
    fileReader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (parsed.tasks) setTasks(parsed.tasks)
        if (parsed.archivedTasks) setArchivedTasks(parsed.archivedTasks)
        if (parsed.customCategories) setCustomCategories(parsed.customCategories)
        if (parsed.focusTotalSeconds) setFocusTotalSeconds(parsed.focusTotalSeconds)
        alert('ZenTodo backup restored successfully!')
      } catch (err) {
        alert('Failed to parse backup file. Please make sure it is a valid ZenTodo JSON file.')
      }
    }
  }

  // --- STATS COMPUTATIONS ---
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const pending = total - completed
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    // Compute stats for all categories combined
    const catStats = CATEGORIES.reduce((acc, cat) => {
      const catTasks = tasks.filter(t => t.category === cat.id)
      const catTotal = catTasks.length
      const catCompleted = catTasks.filter(t => t.completed).length
      acc[cat.id] = {
        total: catTotal,
        completed: catCompleted,
        percent: catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0
      }
      return acc
    }, {})

    return { total, completed, pending, percent, catStats }
  }, [tasks, CATEGORIES])

  // Priority metadata mapping
  const priorityMap = {
    high: { color: 'var(--danger)', rgb: '239, 68, 68', label: 'High' },
    medium: { color: 'var(--warning)', rgb: '245, 158, 11', label: 'Medium' },
    low: { color: 'var(--success)', rgb: '16, 185, 129', label: 'Low' }
  }

  // Filter and Sort active tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Sort: Pinned first, then incomplete first, then by id desc
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1
      return b.id.localeCompare(a.id)
    })

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory)
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.desc && t.desc.toLowerCase().includes(q))
      )
    }

    // Tab Filters
    const todayStr = new Date().toISOString().split('T')[0]
    if (activeFilter === 'today') {
      result = result.filter(t => t.dueDate === todayStr && !t.completed)
    } else if (activeFilter === 'upcoming') {
      result = result.filter(t => t.dueDate > todayStr && !t.completed)
    } else if (activeFilter === 'completed') {
      result = result.filter(t => t.completed)
    }

    return result
  }, [tasks, selectedCategory, searchQuery, activeFilter])

  // Filtered Archive list
  const filteredArchive = useMemo(() => {
    let result = [...archivedTasks]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t => t.title.toLowerCase().includes(q))
    }
    return result
  }, [archivedTasks, searchQuery])

  // Timer formatted duration helper
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // --- RENDERING SUB-ELEMENTS ---
  // Category Detail Header Card (Screen 3)
  const renderCategoryDetailHeader = () => {
    if (selectedCategory === 'all') return null
    const cat = CATEGORIES.find(c => c.id === selectedCategory)
    if (!cat) return null

    const catStat = stats.catStats[selectedCategory] || { total: 0, completed: 0, percent: 0 }
    const activeCount = catStat.total - catStat.completed
    const IconComponent = iconMapping[cat.icon] || Briefcase

    return (
      <div 
        className="category-detail-header-card fade-in" 
        style={{ 
          '--cat-color-rgb': cat.colorRgb,
          borderLeft: `5px solid rgb(${cat.colorRgb})`
        }}
      >
        <div className="cat-detail-top">
          <button className="back-to-all-btn" onClick={() => setSelectedCategory('all')} title="Back to All">
            <ChevronLeft size={16} />
            <span>All Categories</span>
          </button>
          <span className="cat-detail-badge" style={{ backgroundColor: `rgba(${cat.colorRgb}, 0.12)`, color: `rgb(${cat.colorRgb})` }}>
            <IconComponent size={14} />
            <span>{cat.name}</span>
          </span>
        </div>
        
        <div className="cat-detail-stats">
          <h2>{cat.name} Category</h2>
          <p>{activeCount} active tasks, {catStat.completed} completed</p>
        </div>

        <div className="cat-detail-progress-wrapper">
          <div className="cat-detail-progress-info">
            <span>Task Progress</span>
            <span>{catStat.percent}%</span>
          </div>
          <div className="cat-detail-progress-bar">
            <div className="cat-detail-progress-fill" style={{ width: `${catStat.percent}%`, backgroundColor: `rgb(${cat.colorRgb})` }} />
          </div>
        </div>
      </div>
    )
  }

  // SVG Donut Chart (Screen 6)
  const renderDonutChart = () => {
    const data = CATEGORIES.map(cat => {
      const total = tasks.filter(t => t.category === cat.id).length
      return {
        id: cat.id,
        name: cat.name,
        value: total,
        colorHex: cat.colorHex || `rgb(${cat.colorRgb})`
      }
    }).filter(d => d.value > 0)

    const totalValue = data.reduce((sum, d) => sum + d.value, 0)

    if (totalValue === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          <p>No active tasks in categories to display chart.</p>
        </div>
      )
    }

    let accumulatedPercent = 0
    const radius = 70
    const circumference = 2 * Math.PI * radius

    return (
      <div className="donut-chart-wrapper">
        <svg width="200" height="200" viewBox="0 0 200 200" className="donut-chart">
          <circle cx="100" cy="100" r={radius} fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="18" />
          {data.map(item => {
            const percent = item.value / totalValue
            const strokeDashoffset = circumference - (percent * circumference)
            const rotationAngle = (accumulatedPercent * 360) - 90
            accumulatedPercent += percent

            return (
              <circle
                key={item.id}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={item.colorHex}
                strokeWidth="18"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotationAngle} 100 100)`}
                strokeLinecap="round"
                className="donut-segment"
                style={{
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <title>{item.name}: {Math.round(percent * 100)}%</title>
              </circle>
            )
          })}
          <text x="100" y="95" textAnchor="middle" fill="var(--text-primary)" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {totalValue}
          </text>
          <text x="100" y="115" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Tasks
          </text>
        </svg>

        <div className="donut-legend">
          {data.map(item => {
            const percent = Math.round((item.value / totalValue) * 100)
            return (
              <div key={item.id} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.colorHex }} />
                <span className="legend-name">{item.name}</span>
                <span className="legend-val">{percent}% ({item.value})</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Weekly Completion Activity chart
  const renderWeeklyBarChart = () => {
    const days = []
    const taskCounts = []
    const completedTasks = tasks.filter(t => t.completed)

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateStr = d.toISOString().split('T')[0]
      const count = completedTasks.filter(t => t.dueDate === dateStr).length
      days.push(dayName)
      taskCounts.push(count)
    }

    const maxVal = Math.max(...taskCounts, 1)

    return (
      <div className="weekly-chart-container">
        <div className="chart-bars">
          {taskCounts.map((count, idx) => {
            const heightPercent = (count / maxVal) * 100
            return (
              <div key={idx} className="chart-bar-col">
                <div className="bar-value-bubble">{count}</div>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: count > 0 ? `${Math.max(heightPercent, 12)}%` : '0%' 
                    }} 
                  />
                </div>
                <span className="bar-label">{days[idx]}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render PWA Splasher Gated screen if user has not started
  if (!hasStarted) {
    return (
      <div className="landing-screen">
        <div className="landing-glow" />
        <div className="landing-center">
          <div className="landing-logo-container">
            <CheckCircle />
          </div>
          <h1 className="landing-title">ZenTodo</h1>
          <p className="landing-tagline">
            A premium, mindful workspace built for maximum focus and daily productivity.
          </p>
        </div>
        <div className="landing-bottom">
          <button className="landing-btn" onClick={() => setHasStarted(true)}>
            Start Your Zen Journey
          </button>
          <button className="landing-link" onClick={() => setHasStarted(true)}>
            Continue as Guest
          </button>
        </div>
      </div>
    )
  }

  // Main UI Screen
  return (
    <div className="desktop-wrapper">
      <div className="app-container">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="sidebar-desktop">
          <div className="sidebar-logo">
            <CheckCircle size={26} color="var(--primary)" />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>ZenTodo</span>
          </div>
          
          <div className="sidebar-menu">
            <button 
              className={`sidebar-link ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <List size={20} />
              <span>Tasks Dashboard</span>
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'focus' ? 'active' : ''}`}
              onClick={() => setActiveTab('focus')}
            >
              <Hourglass size={20} />
              <span>Zen Focus Mode</span>
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <PieChart size={20} />
              <span>Productivity Stats</span>
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'archive' ? 'active' : ''}`}
              onClick={() => setActiveTab('archive')}
            >
              <Archive size={20} />
              <span>Archived Board</span>
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>

          <div className="sidebar-user">
            <div className="avatar">ZT</div>
            <div className="user-details">
              <span>Zen Mind</span>
              <p>Daily Planner</p>
            </div>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <div className="main-content">
          
          {/* Offline indication banner */}
          {!isOnline && (
            <div className="offline-banner">
              <WifiOff size={14} />
              <span>You are currently offline. Tasks and edits will sync on reconnection.</span>
            </div>
          )}

          {/* TASKS DASHBOARD VIEW */}
          {activeTab === 'tasks' && (
            <div className="tasks-layout-wrapper">
              
              {/* Left Side: Stats and Categories Carousel */}
              <div className="tasks-left-panel">
                <header className="app-header">
                  <div className="header-top">
                    <div className="profile-section">
                      <div className="avatar" style={{ background: 'var(--primary-gradient)' }}>ZT</div>
                      <div className="greeting-text">
                        <h2>Mindful Day</h2>
                        <p>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="header-actions">
                      {installPrompt && (
                        <button onClick={handleInstallApp} className="icon-btn" title="Install ZenTodo App">
                          <Download size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                        className="icon-btn" 
                        title="Toggle Theme Mode"
                      >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Today's completion ring */}
                  <div className="progress-card">
                    <div className="progress-info">
                      <h3>Today's Progress</h3>
                      <p>{stats.completed} of {stats.total} completed ({stats.percent}%)</p>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${stats.percent}%` }} />
                      </div>
                    </div>

                    <div className="radial-progress">
                      <svg viewBox="0 0 36 36">
                        <circle className="bg-circle" cx="18" cy="18" r="15.915" />
                        <circle 
                          className="progress-circle" 
                          cx="18" 
                          cy="18" 
                          r="15.915" 
                          stroke="var(--primary)"
                          strokeDasharray={`${stats.percent} ${100 - stats.percent}`}
                          strokeDashoffset="25" 
                        />
                      </svg>
                      <span className="progress-text">{stats.percent}%</span>
                    </div>
                  </div>
                </header>

                {/* Categories */}
                <section className="categories-container">
                  <div className="section-title">
                    <h4>Task Categories</h4>
                  </div>
                  <div className="categories-scroll">
                    <div 
                      className={`category-card ${selectedCategory === 'all' ? 'active' : ''}`}
                      style={{ '--cat-color-rgb': '139, 92, 246' }}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <div className="category-icon-box">
                        <List size={18} />
                      </div>
                      <div className="category-details">
                        <h5>All Categories</h5>
                        <p>{tasks.length} Items</p>
                      </div>
                    </div>

                    {CATEGORIES.map(cat => {
                      const catStat = stats.catStats[cat.id] || { total: 0, completed: 0, percent: 0 }
                      const IconComponent = iconMapping[cat.icon] || Briefcase
                      return (
                        <div 
                          key={cat.id} 
                          className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                          style={{ '--cat-color-rgb': cat.colorRgb }}
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          <div className="category-icon-box">
                            <IconComponent size={18} />
                          </div>
                          <div className="category-details">
                            <h5>{cat.name}</h5>
                            <p>{catStat.total} Items</p>
                          </div>
                          <div className="category-progress-mini">
                            <div className="category-progress-fill" style={{ width: `${catStat.percent}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Search / Tabs filter */}
                <section className="search-filter-section">
                  <div className="search-box">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Search task titles..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="filter-pills">
                    {['all', 'today', 'upcoming', 'completed'].map(f => (
                      <button 
                        key={f}
                        className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Side: List of Tasks */}
              <div className="tasks-right-panel">
                {renderCategoryDetailHeader()}
                
                <div className="panel-header">
                  <h3>Tasks</h3>
                  <button className="add-task-inline-btn" onClick={handleOpenAddForm}>
                    <Plus size={16} />
                    <span>New Task</span>
                  </button>
                </div>
                
                <main className="tasks-scroll-area">
                  {filteredTasks.length === 0 ? (
                    <div className="empty-state fade-in">
                      <div className="empty-state-icon">
                        <CheckCircle size={40} />
                      </div>
                      <h4>All caught up!</h4>
                      <p>Create a task to get started or clear your filter criteria.</p>
                    </div>
                  ) : (
                    filteredTasks.map(task => {
                      const priorityInfo = priorityMap[task.priority] || priorityMap.medium
                      const categoryInfo = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0]
                      const isExpanded = expandedTaskId === task.id
                      const totalSub = task.subtasks.length
                      const completedSub = task.subtasks.filter(s => s.completed).length

                      return (
                        <div 
                          key={task.id} 
                          className={`task-card fade-in ${task.completed ? 'completed' : ''}`}
                          style={{ 
                            '--priority-color': priorityInfo.color,
                            '--priority-rgb': priorityInfo.rgb
                          }}
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        >
                          {/* Complete Checkbox */}
                          <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              className="checkbox-hidden"
                              checked={task.completed} 
                              onChange={(e) => handleToggleTask(task.id, e)}
                            />
                            <div className="checkbox-custom">
                              <Check />
                            </div>
                          </label>

                          <div className="task-content">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="task-title">
                                <span className="task-title-inner">{task.title}</span>
                              </span>
                              {task.pinned && <Star size={12} fill="var(--warning)" color="var(--warning)" />}
                            </div>

                            {task.desc && <p className={`task-desc ${isExpanded ? 'expanded' : ''}`}>{task.desc}</p>}

                            <div className="task-meta">
                              {task.dueDate && (
                                <div className={`meta-badge ${task.dueDate === new Date().toISOString().split('T')[0] ? 'urgent' : ''}`}>
                                  <Calendar />
                                  <span>{task.dueDate} {task.dueTime || ''}</span>
                                </div>
                              )}
                              
                              {totalSub > 0 && (
                                <div className="meta-badge">
                                  <CheckCircle />
                                  <span>{completedSub}/{totalSub} Subtasks</span>
                                </div>
                              )}

                              <div 
                                className="meta-badge" 
                                style={{ 
                                  color: `rgb(${categoryInfo.colorRgb})`,
                                  borderColor: `rgba(${categoryInfo.colorRgb}, 0.2)`
                                }}
                              >
                                {React.createElement(iconMapping[categoryInfo.icon] || Briefcase, { size: 10 })}
                                <span>{categoryInfo.name}</span>
                              </div>
                            </div>

                            {/* Inline checklist expansion */}
                            <div className={`task-expand-wrapper ${isExpanded ? 'expanded' : ''}`} onClick={(e) => e.stopPropagation()}>
                              <div className="task-expand-inner">
                                {totalSub > 0 && (
                                  <div className="subtasks-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ width: '100%', height: '1px', background: 'var(--card-border)', margin: '4px 0' }} />
                                    <h6 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Quick Checklist</h6>
                                    {task.subtasks.map(sub => (
                                      <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <input 
                                          type="checkbox" 
                                          className="checkbox-hidden"
                                          checked={sub.completed}
                                          onChange={(e) => handleToggleSubtask(task.id, sub.id, e)}
                                        />
                                        <div className="checkbox-custom" style={{ width: '16px', height: '16px', borderRadius: '4px' }}>
                                          <Check style={{ width: '10px', height: '10px', strokeWidth: 5 }} />
                                        </div>
                                        <span className="subtask-title-inner" style={{ color: sub.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                          {sub.title}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                                  <button 
                                    className="secondary-btn" 
                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }} 
                                    onClick={() => setDetailModalTask(task)}
                                  >
                                    Full Details
                                  </button>
                                  <button className="action-btn" onClick={(e) => handleTogglePin(task.id, e)} title="Pin Task">
                                    <Star size={15} fill={task.pinned ? 'var(--warning)' : 'none'} color={task.pinned ? 'var(--warning)' : 'var(--text-muted)'} />
                                  </button>
                                  <button className="action-btn" onClick={(e) => handleOpenEditForm(task, e)} title="Edit Task">
                                    <Edit2 size={15} />
                                  </button>
                                  <button className="action-btn" onClick={(e) => handleArchiveTask(task.id, e)} title="Archive Task">
                                    <Archive size={15} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      )
                    })
                  )}
                </main>
              </div>
            </div>
          )}

          {/* FOCUS POMODORO TIMER MODE */}
          {activeTab === 'focus' && (
            <div className="focus-view fade-in">
              <header className="focus-header">
                <h2>Zen Focus Timer</h2>
                <p>Concentrate on your tasks in silence or flow with ambient sounds.</p>
              </header>

              <div className="timer-circle-container">
                <svg className="timer-circle-svg" viewBox="0 0 100 100">
                  <circle className="timer-circle-bg" cx="50" cy="50" r="45" />
                  <circle 
                    className="timer-circle-progress" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={((1500 - focusTimeLeft) / 1500) * (2 * Math.PI * 45)}
                  />
                </svg>
                <div className="timer-time-display">
                  <h1>{formatTimer(focusTimeLeft)}</h1>
                  <span>{focusTimerActive ? 'Flowing' : 'Paused'}</span>
                </div>
              </div>

              {/* Task connector */}
              <div className="focus-task-card">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Focus Objective</span>
                <select 
                  className="focus-task-select" 
                  value={focusTask}
                  onChange={(e) => setFocusTask(e.target.value)}
                >
                  <option value="none">No specific task - General Focus</option>
                  {tasks.filter(t => !t.completed).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="timer-controls">
                <button className="timer-btn" onClick={() => setFocusTimeLeft(1500)} title="Reset Timer">
                  <RotateCcw size={18} />
                </button>
                <button className="timer-btn play-btn" onClick={() => setFocusTimerActive(!focusTimerActive)} title={focusTimerActive ? 'Pause' : 'Start'}>
                  {focusTimerActive ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
                </button>
              </div>

              {/* Ambient Audio Synthesizers */}
              <div className="ambient-sounds-section">
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                  Mindful Ambient Noise
                </h4>
                <div className="ambient-sounds-grid">
                  <div 
                    className={`ambient-sound-card ${ambientRain ? 'active' : ''}`}
                    onClick={() => handleToggleSound('rain')}
                  >
                    <CloudRain size={20} />
                    <span>Rain</span>
                  </div>
                  <div 
                    className={`ambient-sound-card ${ambientForest ? 'active' : ''}`}
                    onClick={() => handleToggleSound('forest')}
                  >
                    <Trees size={20} />
                    <span>Wind</span>
                  </div>
                  <div 
                    className={`ambient-sound-card ${ambientNoise ? 'active' : ''}`}
                    onClick={() => handleToggleSound('noise')}
                  >
                    <Volume2 size={20} />
                    <span>White Noise</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTIVITY INSIGHTS VIEW */}
          {activeTab === 'stats' && (
            <div className="stats-view fade-in">
              <header style={{ padding: '24px 0 8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Productivity Insights</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review your statistics, category segments, and weekly data</p>
              </header>

              <div className="stats-grid">
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="stat-num">{stats.completed}</span>
                    <CheckCircle size={20} color="var(--primary)" />
                  </div>
                  <span className="stat-label">COMPLETED TASKS</span>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="stat-num">{Math.round((focusTotalSeconds / 3600) * 10) / 10}</span>
                    <Hourglass size={20} color="var(--primary)" />
                  </div>
                  <span className="stat-label">FOCUS HOURS</span>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="stat-num">{stats.percent}%</span>
                    <Award size={20} color="var(--primary)" />
                  </div>
                  <span className="stat-label">SUCCESS RATE</span>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="stat-num">{archivedTasks.length}</span>
                    <Archive size={20} color="var(--primary)" />
                  </div>
                  <span className="stat-label">ARCHIVED HISTORY</span>
                </div>
              </div>

              {/* Segmented breakdown donut */}
              <div className="stats-chart-card">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Category Distribution
                </h4>
                {renderDonutChart()}
              </div>

              {/* Weekly Activity card */}
              <div className="stats-chart-card">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Weekly Completion History
                </h4>
                {renderWeeklyBarChart()}
              </div>

              {stats.completed > 0 && (
                <button 
                  onClick={handleClearCompleted}
                  className="secondary-btn" 
                  style={{ borderColor: 'var(--danger)', color: 'var(--danger)', width: '100%', marginTop: '8px' }}
                >
                  Archive Completed Tasks
                </button>
              )}
            </div>
          )}

          {/* ARCHIVED BOARD & HISTORY VIEW */}
          {activeTab === 'archive' && (
            <div className="stats-view fade-in">
              <header style={{ padding: '24px 0 8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Archived History</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Restore tasks to active list or wipe them from history</p>
              </header>

              <div className="search-box" style={{ marginBottom: '16px' }}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search archive history..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                {filteredArchive.length === 0 ? (
                  <div className="empty-state">
                    <Archive size={40} style={{ color: 'var(--text-muted)' }} />
                    <h4>Archive is empty</h4>
                    <p>Tasks you finish or archive will appear here.</p>
                  </div>
                ) : (
                  filteredArchive.map(task => (
                    <div key={task.id} className="task-card" style={{ cursor: 'default' }}>
                      <div className="task-content" style={{ opacity: 0.7 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, textDecoration: task.completed ? 'line-through' : 'none' }}>
                          {task.title}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Category: {task.category} | Due: {task.dueDate || 'No date'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="secondary-btn" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }} 
                          onClick={() => handleRestoreTask(task.id)}
                        >
                          Restore
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handlePermanentDelete(task.id)}
                          title="Delete Permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="settings-view fade-in">
              <header style={{ padding: '24px 0 8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Custom Settings</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personalize themes, accents, and manage your local data</p>
              </header>

              <div className="settings-list">
                {/* Theme toggle */}
                <div className="settings-item">
                  <div className="settings-item-info">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    <div className="settings-item-text">
                      <span>Dark visual style</span>
                      <p>Toggle dark or light mode appearances</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={theme === 'dark'}
                      onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Accent Color picker */}
                <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <div className="settings-item-info">
                    <Flame size={20} />
                    <div className="settings-item-text">
                      <span>Brand accent theme</span>
                      <p>Customize accent color used throughout the app</p>
                    </div>
                  </div>
                  
                  <div className="accent-picker-list">
                    {['purple', 'blue', 'pink', 'orange', 'teal'].map(color => {
                      const dotsColors = {
                        purple: '#8b5cf6',
                        blue: '#3b82f6',
                        pink: '#ec4899',
                        orange: '#f59e0b',
                        teal: '#10b981'
                      }
                      return (
                        <div 
                          key={color}
                          className={`accent-dot ${accentColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: dotsColors[color] }}
                          onClick={() => setAccentColor(color)}
                        >
                          {accentColor === color && <Check size={14} color="white" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Categories Builder Manager */}
                <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <div className="settings-item-info">
                    <FolderPlus size={20} />
                    <div className="settings-item-text">
                      <span>Custom Categories</span>
                      <p>View and construct personalized task labels</p>
                    </div>
                  </div>

                  <div className="category-manager-section" style={{ width: '100%' }}>
                    <div className="category-manager-list">
                      {CATEGORIES.map(cat => {
                        const isDefault = defaultCategories.some(d => d.id === cat.id)
                        return (
                          <div 
                            key={cat.id} 
                            className={`category-manager-item ${!isDefault ? 'deletable' : ''}`}
                            onClick={() => !isDefault && handleDeleteCustomCategory(cat.id)}
                            title={!isDefault ? 'Click to delete category' : 'Default category'}
                          >
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.colorHex || `rgb(${cat.colorRgb})` }} />
                            <span>{cat.name}</span>
                            {!isDefault && <X size={10} style={{ marginLeft: '4px' }} />}
                          </div>
                        )
                      })}
                    </div>

                    {!isCategoryFormOpen ? (
                      <button 
                        className="secondary-btn" 
                        style={{ marginTop: '8px', width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => setIsCategoryFormOpen(true)}
                      >
                        <Plus size={14} />
                        <span>Build Custom Category</span>
                      </button>
                    ) : (
                      <form onSubmit={handleCreateCategory} className="category-builder-form fade-in">
                        <div className="form-group">
                          <label>Category Name</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="E.g. Study, Home, Coding..."
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Color Picker</label>
                          <input 
                            type="color" 
                            value={newCatColor} 
                            onChange={(e) => setNewCatColor(e.target.value)}
                            style={{ width: '100%', height: '36px', border: '1px solid var(--card-border)', background: 'none', cursor: 'pointer' }}
                          />
                        </div>

                        <div className="form-group">
                          <label>Choose Icon</label>
                          <div className="icon-options-grid">
                            {['Briefcase', 'User', 'Activity', 'CreditCard', 'Star', 'Book', 'Heart', 'FileText', 'Info'].map(iconName => {
                              const OptionIcon = iconMapping[iconName] || Star
                              return (
                                <button
                                  key={iconName}
                                  type="button"
                                  className={`icon-option-btn ${newCatIcon === iconName ? 'selected' : ''}`}
                                  onClick={() => setNewCatIcon(iconName)}
                                >
                                  <OptionIcon size={16} />
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button type="submit" className="primary-btn" style={{ flex: 1, padding: '10px' }}>Create</button>
                          <button type="button" className="secondary-btn" style={{ flex: 1, padding: '10px' }} onClick={() => setIsCategoryFormOpen(false)}>Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Local data management and Backup */}
                <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
                  <div className="settings-item-info">
                    <Download size={20} />
                    <div className="settings-item-text">
                      <span>Local Data & backups</span>
                      <p>Import or export your tasks JSON file locally</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button className="secondary-btn" style={{ flex: 1, fontSize: '0.8rem' }} onClick={handleExportData}>
                      Backup Data
                    </button>
                    <label className="secondary-btn" style={{ flex: 1, fontSize: '0.8rem', textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={14} style={{ marginRight: '6px' }} />
                      <span>Restore</span>
                      <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <Trash2 size={20} />
                    <div className="settings-item-text">
                      <span>Reset Application</span>
                      <p>Wipe all tasks, archives, and custom categories permanently</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Reset application? This will wipe all data.')) {
                        setTasks([])
                        setArchivedTasks([])
                        setCustomCategories([])
                        setFocusTotalSeconds(0)
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                    className="secondary-btn" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    Reset App
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '16px 0' }}>
                <p>ZenTodo Premium PWA v1.2.0</p>
                <p>Mindful Productivity Space</p>
              </div>
            </div>
          )}

        </div> {/* End of main-content */}

        {/* BOTTOM NAV BAR (Mobile layout) */}
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <List />
            <span>Tasks</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'focus' ? 'active' : ''}`}
            onClick={() => setActiveTab('focus')}
          >
            <Hourglass />
            <span>Focus</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <PieChart />
            <span>Stats</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            <Archive />
            <span>Archive</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings />
            <span>Settings</span>
          </button>
        </nav>

        {/* FLOATING ACTION BUTTON (Tasks only) */}
        {activeTab === 'tasks' && (
          <button className="add-fab" onClick={handleOpenAddForm} title="Create New Task">
            <Plus />
          </button>
        )}

        {/* ADD / EDIT TASK MODAL SHEET */}
        {isFormOpen && (
          <div className="bottom-sheet-overlay" onClick={() => setIsFormOpen(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-header">
                <h3>{editingTask ? 'Edit Mindful Task' : 'Begin New Task'}</h3>
                <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="E.g., Meditation, Work Proposal, Reading..." 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Description / Notes</label>
                  <textarea 
                    className="form-input form-textarea" 
                    placeholder="Mindful details or sub-objectives..." 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <div className="cat-picker-grid">
                    {CATEGORIES.map(cat => {
                      const IconComponent = iconMapping[cat.icon] || Briefcase
                      return (
                        <div 
                          key={cat.id}
                          className={`cat-picker-item ${formCategory === cat.id ? 'selected' : ''}`}
                          style={{ '--cat-color-rgb': cat.colorRgb }}
                          onClick={() => setFormCategory(cat.id)}
                        >
                          <div className="cat-picker-icon">
                            <IconComponent size={16} />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Priority</label>
                    <div className="priority-selector">
                      {['low', 'medium', 'high'].map(prio => {
                        const colors = {
                          low: { hex: 'var(--success)', rgb: '16, 185, 129' },
                          medium: { hex: 'var(--warning)', rgb: '245, 158, 11' },
                          high: { hex: 'var(--danger)', rgb: '239, 68, 68' }
                        }
                        return (
                          <button 
                            key={prio}
                            type="button"
                            className={`priority-btn ${formPriority === prio ? 'selected' : ''}`}
                            style={{ '--priority-color': colors[prio].hex, '--priority-rgb': colors[prio].rgb }}
                            onClick={() => setFormPriority(prio)}
                          >
                            {prio.charAt(0).toUpperCase() + prio.slice(1, 3)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Due Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Due Time</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      value={formDueTime}
                      onChange={(e) => setFormDueTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Subtask checklist builder */}
                <div className="form-group">
                  <label>Checklist Subtasks ({formSubtasks.length})</label>
                  
                  {formSubtasks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                      {formSubtasks.map(sub => (
                        <div key={sub.id} className="subtask-builder-item">
                          <span>{sub.title}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSubtaskInForm(sub.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="subtask-input-row">
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ flex: 1 }}
                      placeholder="Add subtask items..." 
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSubtaskInForm()
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="secondary-btn"
                      onClick={handleAddSubtaskInForm}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <PlusCircle size={18} />
                    </button>
                  </div>
                </div>

                <button type="submit" className="primary-btn">
                  <Check size={18} />
                  <span>{editingTask ? 'Save Updates' : 'Launch Task'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DEDICATED TASK SUBTASK MANAGER DETAILS MODAL (Screen 5) */}
        {detailModalTask && (() => {
          const priorityInfo = priorityMap[detailModalTask.priority] || priorityMap.medium
          const categoryInfo = CATEGORIES.find(c => c.id === detailModalTask.category) || CATEGORIES[0]
          const totalSub = detailModalTask.subtasks.length
          const completedSub = detailModalTask.subtasks.filter(s => s.completed).length
          const progressPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0
          
          return (
            <div className="details-modal-overlay" onClick={() => setDetailModalTask(null)}>
              <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                
                <div className="details-modal-header">
                  <div>
                    <span 
                      className="cat-detail-badge" 
                      style={{ 
                        backgroundColor: `rgba(${categoryInfo.colorRgb}, 0.1)`, 
                        color: `rgb(${categoryInfo.colorRgb})`,
                        marginBottom: '8px'
                      }}
                    >
                      {React.createElement(iconMapping[categoryInfo.icon] || Briefcase, { size: 12 })}
                      <span>{categoryInfo.name}</span>
                    </span>
                    <h3 className="details-modal-title">{detailModalTask.title}</h3>
                  </div>
                  
                  <button className="action-btn" onClick={() => setDetailModalTask(null)}>
                    <X size={20} />
                  </button>
                </div>

                {detailModalTask.desc && (
                  <p className="details-modal-desc">{detailModalTask.desc}</p>
                )}

                {/* Meta details list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {detailModalTask.dueDate && (
                    <div className="meta-badge">
                      <Calendar size={12} />
                      <span>Due: {detailModalTask.dueDate} {detailModalTask.dueTime || ''}</span>
                    </div>
                  )}
                  <div className="meta-badge" style={{ color: priorityInfo.color, borderColor: `rgba(${priorityInfo.rgb}, 0.2)` }}>
                    <Star size={12} fill={detailModalTask.pinned ? priorityInfo.color : 'none'} />
                    <span>Priority: {priorityInfo.label}</span>
                  </div>
                </div>

                {/* Subtasks progress and interactive list */}
                <div className="details-modal-section-title">
                  Checklist Progress ({completedSub}/{totalSub})
                </div>

                <div className="cat-detail-progress-bar" style={{ marginBottom: '16px', height: '8px' }}>
                  <div 
                    className="cat-detail-progress-fill" 
                    style={{ width: `${progressPercent}%`, backgroundColor: 'var(--primary)' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {detailModalTask.subtasks.map(sub => (
                    <label 
                      key={sub.id} 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      <input 
                        type="checkbox" 
                        className="checkbox-hidden"
                        checked={sub.completed}
                        onChange={() => handleToggleSubtask(detailModalTask.id, sub.id)}
                      />
                      <div className="checkbox-custom" style={{ width: '18px', height: '18px', borderRadius: '4px' }}>
                        <Check style={{ width: '12px', height: '12px', strokeWidth: 5 }} />
                      </div>
                      <span className="subtask-title-inner" style={{ color: sub.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {sub.title}
                      </span>
                    </label>
                  ))}

                  {/* Inline subtask addition */}
                  <div className="subtask-input-row" style={{ marginTop: '8px' }}>
                    <input 
                      type="text" 
                      id="details-inline-sub-input"
                      className="form-input" 
                      style={{ flex: 1 }}
                      placeholder="Add items to checklist..." 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddInlineSubtask(detailModalTask.id, e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="secondary-btn"
                      onClick={() => {
                        const input = document.getElementById('details-inline-sub-input')
                        if (input) {
                          handleAddInlineSubtask(detailModalTask.id, input.value)
                          input.value = ''
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <PlusCircle size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal footer actions */}
                <div className="details-modal-actions">
                  <button 
                    className="secondary-btn" 
                    onClick={() => {
                      setDetailModalTask(null)
                      handleOpenEditForm(detailModalTask)
                    }}
                  >
                    Edit Details
                  </button>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="action-btn" 
                      onClick={(e) => handleTogglePin(detailModalTask.id, e)}
                      title="Pin Task"
                    >
                      <Star size={16} fill={detailModalTask.pinned ? 'var(--warning)' : 'none'} color={detailModalTask.pinned ? 'var(--warning)' : 'var(--text-muted)'} />
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={(e) => handleArchiveTask(detailModalTask.id, e)}
                      title="Archive Task"
                    >
                      <Archive size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => {
                        if (confirm('Delete this task?')) {
                          setTasks(tasks.filter(t => t.id !== detailModalTask.id))
                          setDetailModalTask(null)
                        }
                      }}
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}

export default App