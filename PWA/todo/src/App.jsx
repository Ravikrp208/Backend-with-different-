import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  Calendar,
  Clock,
  Search,
  Briefcase,
  User,
  Activity,
  CreditCard,
  Settings,
  Sun,
  Moon,
  Download,
  WifiOff,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  PieChart,
  List,
  CheckCircle,
  PlusCircle
} from 'lucide-react'
import { triggerConfetti } from './utils/confetti'

// Default Categories definition
const CATEGORIES = [
  { id: 'work', name: 'Work', icon: Briefcase, colorRgb: '139, 92, 246' }, // Purple
  { id: 'personal', name: 'Personal', icon: User, colorRgb: '236, 72, 153' }, // Pink
  { id: 'health', name: 'Health', icon: Activity, colorRgb: '16, 185, 129' }, // Green
  { id: 'finance', name: 'Finance', icon: CreditCard, colorRgb: '245, 158, 11' } // Orange
]

const App = () => {
  // Load tasks from localStorage
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('pwa_todo_tasks')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("Failed to parse tasks", e)
      }
    }
    return [
      {
        id: '1',
        title: 'Design Premium PWA UI',
        desc: 'Implement responsive layout, glassmorphic themes, and offline functionality.',
        category: 'work',
        priority: 'high',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '12:00',
        completed: false,
        pinned: true,
        subtasks: [
          { id: 'sub-1', title: 'Write responsive CSS system', completed: true },
          { id: 'sub-2', title: 'Implement React application states', completed: false },
          { id: 'sub-3', title: 'Test service workers & install event', completed: false }
        ]
      },
      {
        id: '2',
        title: 'Weekly Budget Review',
        desc: 'Review expenses and balance checkbooks.',
        category: 'finance',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        dueTime: '18:30',
        completed: false,
        pinned: false,
        subtasks: []
      },
      {
        id: '3',
        title: 'Evening Jog & Cardio',
        desc: 'Run 5km around the park and do core stretches.',
        category: 'health',
        priority: 'low',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '17:00',
        completed: true,
        pinned: false,
        subtasks: []
      }
    ]
  })

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pwa_todo_theme') || 'dark'
  })

  // Navigation state
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'stats' | 'settings'

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'today' | 'upcoming' | 'completed'

  // Expandable task state
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // PWA install states
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Task Form inputs
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('work')
  const [formPriority, setFormPriority] = useState('medium')
  const [formDueDate, setFormDueDate] = useState('')
  const [formDueTime, setFormDueTime] = useState('')
  const [formSubtasks, setFormSubtasks] = useState([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pwa_todo_tasks', JSON.stringify(tasks))
  }, [tasks])

  // Sync theme
  useEffect(() => {
    localStorage.setItem('pwa_todo_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Online / Offline status monitoring
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

  // Action to trigger PWA installation
  const handleInstallApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  // Open Form modal for adding
  const handleOpenAddForm = () => {
    setEditingTask(null)
    setFormTitle('')
    setFormDesc('')
    setFormCategory('work')
    setFormPriority('medium')
    setFormDueDate(new Date().toISOString().split('T')[0])
    setFormDueTime('12:00')
    setFormSubtasks([])
    setNewSubtaskTitle('')
    setIsFormOpen(true)
  }

  // Open Form modal for editing
  const handleOpenEditForm = (task, e) => {
    e.stopPropagation()
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
  const handleRemoveSubtaskInForm = (id) => {
    setFormSubtasks(formSubtasks.filter(sub => sub.id !== id))
  }

  // Form Submit (Create or Update)
  const handleSaveTask = (e) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    if (editingTask) {
      // Edit existing task
      setTasks(tasks.map(t => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            title: formTitle.trim(),
            desc: formDesc.trim(),
            category: formCategory,
            priority: formPriority,
            dueDate: formDueDate,
            dueTime: formDueTime,
            subtasks: formSubtasks
          }
        }
        return t
      }))
    } else {
      // Create new task
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
    e.stopPropagation()
    let becameCompleted = false
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed
        if (nextCompleted) {
          becameCompleted = true
        }
        // If task is completed, also optionally complete all subtasks
        const updatedSubtasks = t.subtasks.map(sub => ({
          ...sub,
          completed: nextCompleted ? true : sub.completed
        }))
        return { ...t, completed: nextCompleted, subtasks: updatedSubtasks }
      }
      return t
    }))
    if (becameCompleted) {
      triggerConfetti()
    }
  }

  // Toggle Subtask Completion in View
  const handleToggleSubtask = (taskId, subtaskId, e) => {
    e.stopPropagation()
    let becameCompleted = false
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(sub => {
          if (sub.id === subtaskId) {
            return { ...sub, completed: !sub.completed }
          }
          return sub
        })
        // If all subtasks are completed, do we complete the task?
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed)
        const nextCompleted = allCompleted ? true : t.completed
        if (nextCompleted && !t.completed) {
          becameCompleted = true
        }
        return {
          ...t,
          subtasks: updatedSubtasks,
          // Auto-mark completed if subtasks are done
          completed: nextCompleted
        }
      }
      return t
    }))
    if (becameCompleted) {
      triggerConfetti()
    }
  }

  // Toggle Pinned status
  const handleTogglePin = (id, e) => {
    e.stopPropagation()
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, pinned: !t.pinned }
      }
      return t
    }))
  }

  // Delete Task
  const handleDeleteTask = (id, e) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id))
      if (expandedTaskId === id) {
        setExpandedTaskId(null)
      }
    }
  }

  // Clear All Completed Tasks
  const handleClearCompleted = () => {
    if (confirm("Clear all completed tasks?")) {
      setTasks(tasks.filter(t => !t.completed))
    }
  }

  // Priority styling and mappings
  const priorityMap = {
    high: { color: 'var(--danger)', rgb: '239, 68, 68', label: 'High' },
    medium: { color: 'var(--warning)', rgb: '245, 158, 11', label: 'Medium' },
    low: { color: 'var(--success)', rgb: '16, 185, 129', label: 'Low' }
  }

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Sort: Pinned first, then incomplete first, then by date/id
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1
      return b.id.localeCompare(a.id)
    })

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory)
    }

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.desc && t.desc.toLowerCase().includes(q))
      )
    }

    // Filter by tab filters (Today, Upcoming, Completed)
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

  // Count stats
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const pending = total - completed
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    // Stats per category
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
  }, [tasks])

  return (
    <div className="desktop-wrapper">
      <div className="app-container">
        
        {/* Desktop Sidebar (Left side navigation on large screens) */}
        <aside className="sidebar-desktop">
          <div className="sidebar-logo">
            <CheckCircle size={26} color="var(--primary)" />
            <span>ZenTodo</span>
          </div>
          
          <div className="sidebar-menu">
            <button 
              className={`sidebar-link ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <List size={20} />
              <span>Tasks</span>
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <PieChart size={20} />
              <span>Analytics</span>
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
            <div className="avatar">U</div>
            <div className="user-details">
              <span>Guest User</span>
              <p>Premium Account</p>
            </div>
          </div>
        </aside>

        {/* Main Application Container */}
        <div className="main-content">
          
          {/* Offline Banner indicator */}
          {!isOnline && (
            <div className="offline-banner">
              <WifiOff size={14} />
              <span>You are currently offline. Tasks will sync when connection returns.</span>
            </div>
          )}

          {/* Dashboard View */}
          {activeTab === 'tasks' && (
            <div className="tasks-layout-wrapper">
              
              {/* Left Panel: Header, Stats and Filtering (Sidebar content on Desktop) */}
              <div className="tasks-left-panel">
                
                {/* Header */}
                <header className="app-header">
                  <div className="header-top">
                    <div className="profile-section">
                      <div className="avatar">U</div>
                      <div className="greeting-text">
                        <h2>Hello, User</h2>
                        <p>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="header-actions">
                      {installPrompt && (
                        <button onClick={handleInstallApp} className="icon-btn" title="Install App">
                          <Download size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                        className="icon-btn" 
                        title="Toggle Theme"
                      >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Today's completion progress */}
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
                        <defs>
                          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <circle className="bg-circle" cx="18" cy="18" r="15.915" />
                        <circle 
                          className="progress-circle" 
                          cx="18" 
                          cy="18" 
                          r="15.915" 
                          strokeDasharray={`${stats.percent} ${100 - stats.percent}`}
                          strokeDashoffset="25" 
                        />
                      </svg>
                      <span className="progress-text">{stats.percent}%</span>
                    </div>
                  </div>
                </header>

                {/* Categories Carousel */}
                <section className="categories-container">
                  <div className="section-title">
                    <h4>Categories</h4>
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
                        <h5>All Tasks</h5>
                        <p>{tasks.length} Items</p>
                      </div>
                    </div>

                    {CATEGORIES.map(cat => {
                      const catStat = stats.catStats[cat.id]
                      const Icon = cat.icon
                      return (
                        <div 
                          key={cat.id} 
                          className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                          style={{ '--cat-color-rgb': cat.colorRgb }}
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          <div className="category-icon-box">
                            <Icon size={18} />
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

                {/* Search & Filter pills */}
                <section className="search-filter-section">
                  <div className="search-box">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Search tasks..." 
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
                    <button 
                      className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-pill ${activeFilter === 'today' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('today')}
                    >
                      Today
                    </button>
                    <button 
                      className={`filter-pill ${activeFilter === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button 
                      className={`filter-pill ${activeFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('completed')}
                    >
                      Completed
                    </button>
                  </div>
                </section>
              </div>

              {/* Right Panel: Scrollable Task Cards (List panel on Desktop) */}
              <div className="tasks-right-panel">
                <div className="panel-header">
                  <h3>My Tasks</h3>
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
                      <h4>No tasks found</h4>
                      <p>Create a task to kickstart your day or clear filters to view more.</p>
                    </div>
                  ) : (
                    filteredTasks.map(task => {
                      const priorityInfo = priorityMap[task.priority]
                      const categoryInfo = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0]
                      const isExpanded = expandedTaskId === task.id
                      const totalSubtasks = task.subtasks.length
                      const completedSubtasks = task.subtasks.filter(s => s.completed).length

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
                          {/* Custom Checkbox */}
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

                          {/* Info */}
                          <div className="task-content">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="task-title">
                                <span className="task-title-inner">{task.title}</span>
                              </span>
                              {task.pinned && <Star size={12} fill="var(--warning)" color="var(--warning)" style={{ flexShrink: 0 }} />}
                            </div>

                            {task.desc && <p className={`task-desc ${isExpanded ? 'expanded' : ''}`}>{task.desc}</p>}

                            {/* Meta indicators */}
                            <div className="task-meta">
                              {task.dueDate && (
                                <div className={`meta-badge ${task.dueDate === new Date().toISOString().split('T')[0] ? 'urgent' : ''}`}>
                                  <Calendar />
                                  <span>{task.dueDate} {task.dueTime || ''}</span>
                                </div>
                              )}
                              
                              {totalSubtasks > 0 && (
                                <div className="meta-badge">
                                  <CheckCircle />
                                  <span>{completedSubtasks}/{totalSubtasks} Checklist</span>
                                </div>
                              )}

                              <div 
                                className="meta-badge" 
                                style={{ 
                                  color: `rgb(${categoryInfo.colorRgb})`,
                                  borderColor: `rgba(${categoryInfo.colorRgb}, 0.2)`
                                }}
                              >
                                {React.createElement(categoryInfo.icon, { size: 10 })}
                                <span>{categoryInfo.name}</span>
                              </div>
                            </div>

                            {/* Expanded Checklist Subtask Details with CSS height animation wrapper */}
                            <div className={`task-expand-wrapper ${isExpanded ? 'expanded' : ''}`} onClick={(e) => e.stopPropagation()}>
                              <div className="task-expand-inner">
                                {totalSubtasks > 0 && (
                                  <div 
                                    className="subtasks-list" 
                                    style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                                  >
                                    <div style={{ width: '100%', height: '1px', background: 'var(--card-border)', margin: '4px 0' }} />
                                    <h6 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Checklist</h6>
                                    
                                    {task.subtasks.map(sub => (
                                      <label 
                                        key={sub.id} 
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}
                                      >
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

                                {/* Options panel when expanded */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                                  <button className="action-btn" onClick={(e) => handleTogglePin(task.id, e)} title="Pin Task">
                                    <Star size={15} fill={task.pinned ? 'var(--warning)' : 'none'} color={task.pinned ? 'var(--warning)' : 'var(--text-muted)'} />
                                  </button>
                                  <button className="action-btn" onClick={(e) => handleOpenEditForm(task, e)} title="Edit Task">
                                    <Edit2 size={15} />
                                  </button>
                                  <button className="action-btn delete-btn" onClick={(e) => handleDeleteTask(task.id, e)} title="Delete Task">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expand Chevron Icon indicator */}
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

          {/* Stats View */}
          {activeTab === 'stats' && (
            <div className="stats-view fade-in">
              <header style={{ padding: '24px 0 8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Analytics</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review your task productivity breakdown</p>
              </header>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-num">{stats.completed}</span>
                  <span className="stat-label">COMPLETED</span>
                </div>
                <div className="stat-card">
                  <span className="stat-num">{stats.pending}</span>
                  <span className="stat-label">PENDING</span>
                </div>
              </div>

              <div className="stats-chart-card">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Category Progress</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  {CATEGORIES.map(cat => {
                    const catStat = stats.catStats[cat.id]
                    return (
                      <div key={cat.id} className="chart-bar-row">
                        <span className="chart-label">{cat.name}</span>
                        <div className="chart-bar-bg">
                          <div 
                            className="chart-bar-fill" 
                            style={{ 
                              width: `${catStat.percent}%`,
                              '--cat-color-rgb': cat.colorRgb
                            }} 
                          />
                        </div>
                        <span className="chart-val">{catStat.percent}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {stats.completed > 0 && (
                <button 
                  onClick={handleClearCompleted}
                  className="secondary-btn" 
                  style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginTop: 'auto' }}
                >
                  Clear All Completed Tasks
                </button>
              )}
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="settings-view fade-in">
              <header style={{ padding: '24px 0 8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Settings</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Adjust options and PWA details</p>
              </header>

              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-item-info">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    <div className="settings-item-text">
                      <span>Dark Theme</span>
                      <p>Toggle light/dark visual theme</p>
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

                {installPrompt && (
                  <div className="settings-item">
                    <div className="settings-item-info">
                      <Download size={20} />
                      <div className="settings-item-text">
                        <span>Install Web App</span>
                        <p>Run Todo App locally as a desktop or mobile application</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleInstallApp}
                      className="primary-btn" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Install
                    </button>
                  </div>
                )}

                <div className="settings-item">
                  <div className="settings-item-info">
                    <Settings size={20} />
                    <div className="settings-item-text">
                      <span>Local Data Management</span>
                      <p>Clear all task lists stored on this device</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm("Reset application? All tasks will be wiped permanently.")) {
                        setTasks([])
                        localStorage.removeItem('pwa_todo_tasks')
                      }
                    }}
                    className="secondary-btn" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    Clear Data
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '16px 0' }}>
                <p>Todo PWA v1.0.0</p>
                <p>Made with React & CSS Grid</p>
              </div>
            </div>
          )}

        </div> {/* End of main-content */}

        {/* Bottom Tab Bar Navigation (Visible only on mobile devices) */}
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <List />
            <span>Tasks</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <PieChart />
            <span>Stats</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings />
            <span>Settings</span>
          </button>
        </nav>

        {/* Add Floating Action Button (FAB) - Floating at bottom-right */}
        {activeTab === 'tasks' && (
          <button className="add-fab" onClick={handleOpenAddForm} title="Add New Task">
            <Plus />
          </button>
        )}

        {/* Add / Edit Task Modal Overlay Bottom Sheet */}
        {isFormOpen && (
          <div className="bottom-sheet-overlay" onClick={() => setIsFormOpen(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-header">
                <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Title */}
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="E.g., Buy groceries, Write report..." 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-input form-textarea" 
                    placeholder="Add details, notes, or links..." 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                {/* Category Picker */}
                <div className="form-group">
                  <label>Category</label>
                  <div className="cat-picker-grid">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon
                      return (
                        <div 
                          key={cat.id}
                          className={`cat-picker-item ${formCategory === cat.id ? 'selected' : ''}`}
                          style={{ '--cat-color-rgb': cat.colorRgb }}
                          onClick={() => setFormCategory(cat.id)}
                        >
                          <div className="cat-picker-icon">
                            <Icon size={16} />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Priority & Due Date Row */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Priority</label>
                    <div className="priority-selector">
                      <button 
                        type="button"
                        className={`priority-btn ${formPriority === 'low' ? 'selected' : ''}`}
                        style={{ '--priority-color': 'var(--success)', '--priority-rgb': '16, 185, 129' }}
                        onClick={() => setFormPriority('low')}
                      >
                        Low
                      </button>
                      <button 
                        type="button"
                        className={`priority-btn ${formPriority === 'medium' ? 'selected' : ''}`}
                        style={{ '--priority-color': 'var(--warning)', '--priority-rgb': '245, 158, 11' }}
                        onClick={() => setFormPriority('medium')}
                      >
                        Med
                      </button>
                      <button 
                        type="button"
                        className={`priority-btn ${formPriority === 'high' ? 'selected' : ''}`}
                        style={{ '--priority-color': 'var(--danger)', '--priority-rgb': '239, 68, 68' }}
                        onClick={() => setFormPriority('high')}
                      >
                        High
                      </button>
                    </div>
                  </div>
                </div>

                {/* Due Date & Time */}
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

                {/* Subtask Builder checklist */}
                <div className="form-group">
                  <label>Checklist / Subtasks ({formSubtasks.length})</label>
                  
                  {/* List of current subtasks in builder */}
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
                      placeholder="Add subtask details..." 
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

                {/* Save Button */}
                <button type="submit" className="primary-btn">
                  <Check size={18} />
                  <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App