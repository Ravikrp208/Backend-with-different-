"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Mail,
  Plus,
  Trash2,
  LogOut,
  ListTodo,
  Check,
  Sun,
  Moon,
  Search,
  Calendar,
  BookOpen,
  User,
  Briefcase,
  LayoutGrid,
  Target,
  Clock,
  Sparkles,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

const USER_KEY = "zentodo_user";
const TODOS_KEY = "zentodo_todos";
const THEME_KEY = "zentodo_theme";

const CATEGORIES = [
  { id: "all", label: "All Tasks", icon: LayoutGrid },
  { id: "school", label: "School", icon: BookOpen },
  { id: "personal", label: "Personal", icon: User },
  { id: "work", label: "Work", icon: Briefcase },
];

const PRIORITIES = [
  { id: "high", label: "High", badge: "badge-high" },
  { id: "medium", label: "Medium", badge: "badge-medium" },
  { id: "low", label: "Low", badge: "badge-low" },
];

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "done", label: "Completed" },
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getInitials(email) {
  return email.charAt(0).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return due < today;
}

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadTodos(email) {
  try {
    const raw = localStorage.getItem(`${TODOS_KEY}_${email}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(email, todos) {
  localStorage.setItem(`${TODOS_KEY}_${email}`, JSON.stringify(todos));
}

function BackgroundBlobs() {
  return (
    <div className="bg-blobs" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}

export default function TodoApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newCategory, setNewCategory] = useState("school");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDue, setNewDue] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadUser();
    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (saved?.email) {
      setUser(saved);
      setTodos(loadTodos(saved.email));
    }
    setReady(true);
  }, []);

  const persistTodos = useCallback(
    (updated) => {
      if (!user?.email) return;
      saveTodos(user.email, updated);
    },
    [user]
  );

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setEmailError("Email is required"); return; }
    if (!isValidEmail(trimmed)) { setEmailError("Please enter a valid email address"); return; }
    setEmailError("");
    const userData = { email: trimmed };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setTodos(loadTodos(trimmed));
    setEmail("");
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setTodos([]);
    setCategory("all");
    setStatusFilter("all");
    setSearch("");
  };

  const addTodo = (e) => {
    e.preventDefault();
    const text = newTodo.trim();
    if (!text) return;
    const todo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      category: newCategory,
      priority: newPriority,
      dueDate: newDue || null,
      createdAt: Date.now(),
    };
    const updated = [todo, ...todos];
    setTodos(updated);
    persistTodos(updated);
    setNewTodo("");
    setNewDue("");
  };

  const toggleTodo = (id) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(updated);
    persistTodos(updated);
  };

  const deleteTodo = (id) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    persistTodos(updated);
  };

  const clearCompleted = () => {
    const updated = todos.filter((t) => !t.done);
    setTodos(updated);
    persistTodos(updated);
  };

  const countByCategory = (cat) => {
    if (cat === "all") return todos.filter((t) => !t.done).length;
    return todos.filter((t) => t.category === cat && !t.done).length;
  };

  const filtered = todos.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (statusFilter === "active" && t.done) return false;
    if (statusFilter === "done" && !t.done) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;
  const highCount = todos.filter((t) => !t.done && t.priority === "high").length;
  const overdueCount = todos.filter((t) => !t.done && isOverdue(t.dueDate)).length;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const allDone = todos.length > 0 && activeCount === 0;

  if (!ready) return null;

  if (!user) {
    return (
      <>
        <BackgroundBlobs />
        <div className="auth-page">
          <div className="auth-hero">
            <div className="brand">
              <div className="brand-icon"><CheckSquare size={24} /></div>
              <div>
                <div className="brand-name">ZenTodo</div>
                <div className="brand-tag">Smart Task Manager PWA</div>
              </div>
            </div>
            <h1 className="hero-title">
              Organize your life,<br />
              <span>one task at a time.</span>
            </h1>
            <p className="hero-desc">
              A modern Progressive Web App built with Next.js. Manage school,
              work, and personal tasks with categories, priorities, and due dates.
            </p>
            <div className="feature-list">
              {[
                "Email-based secure login",
                "Categories: School, Personal, Work",
                "Priority levels & due dates",
                "Works offline as a PWA",
                "Dark & Light mode support",
              ].map((f) => (
                <div key={f} className="feature-item">
                  <span className="feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="auth-panel">
            <div className="auth-card">
              <h2>Welcome back</h2>
              <p className="subtitle">Sign in with your email to get started</p>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrap">
                    <Mail size={17} />
                    <input
                      type="email"
                      className={`input${emailError ? " error" : ""}`}
                      placeholder="student@school.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  {emailError && <p className="error-msg">{emailError}</p>}
                </div>
                <button type="submit" className="btn btn-primary">
                  <Mail size={17} />
                  Continue with Email
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundBlobs />

      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><CheckSquare size={18} /></div>
          <div className="brand-name">ZenTodo</div>
        </div>

        <p className="sidebar-section">Categories</p>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              className={`nav-item${category === cat.id ? " active" : ""}`}
              onClick={() => { setCategory(cat.id); setSidebarOpen(false); }}
            >
              <Icon size={16} />
              {cat.label}
              <span className="nav-count">{countByCategory(cat.id)}</span>
            </button>
          );
        })}

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{getInitials(user.email)}</div>
            <div className="user-info">
              <div className="user-email">{user.email}</div>
            </div>
            <button className="btn-icon" onClick={handleLogout} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="main-header">
          <div className="greeting">
            <h1>{getGreeting()} 👋</h1>
            <p>You have <strong>{activeCount}</strong> task{activeCount !== 1 ? "s" : ""} to complete today</p>
          </div>
          <div className="header-actions">
            <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon blue"><ListTodo size={20} /></div>
            <div className="stat-info">
              <div className="stat-value">{todos.length}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow"><Clock size={20} /></div>
            <div className="stat-info">
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Target size={20} /></div>
            <div className="stat-info">
              <div className="stat-value">{doneCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><TrendingUp size={20} /></div>
            <div className="stat-info">
              <div className="stat-value">{highCount}</div>
              <div className="stat-label">High Priority</div>
            </div>
          </div>
        </div>

        {todos.length > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <h3>Overall Progress</h3>
              <span className="progress-pct">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {allDone && (
          <div className="celebrate">
            <Sparkles size={22} />
            <p>Amazing! You&apos;ve completed all your tasks. Great job! 🎉</p>
          </div>
        )}

        <div className="add-task-card">
          <h3>+ Add New Task</h3>
          <form className="add-form" onSubmit={addTodo}>
            <div className="add-form-row">
              <input
                className="input no-icon"
                type="text"
                placeholder="What do you need to do?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                maxLength={200}
              />
              <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={!newTodo.trim()}>
                <Plus size={17} />
                Add Task
              </button>
            </div>
            <div className="add-form-meta">
              <select className="select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="school">📚 School</option>
                <option value="personal">👤 Personal</option>
                <option value="work">💼 Work</option>
              </select>
              <select className="select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
              <input
                className="input no-icon"
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </form>
        </div>

        <div className="task-toolbar">
          <div className="search-wrap">
            <Search size={15} />
            <input
              className="search-input"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                className={`pill${statusFilter === f.id ? " active" : ""}`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {doneCount > 0 && (
            <button className="btn btn-ghost" onClick={clearCompleted}>
              Clear done
            </button>
          )}
        </div>

        {overdueCount > 0 && statusFilter !== "done" && (
          <div className="celebrate" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            <Clock size={20} />
            <p>{overdueCount} task{overdueCount !== 1 ? "s are" : " is"} overdue — complete them soon!</p>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><ListTodo size={32} /></div>
            <h3>No tasks found</h3>
            <p>
              {search
                ? `No results for "${search}"`
                : statusFilter === "done"
                  ? "No completed tasks yet."
                  : "Add your first task above to get started!"}
            </p>
          </div>
        ) : (
          <ul className="task-list">
            {filtered.map((todo) => {
              const prio = PRIORITIES.find((p) => p.id === todo.priority) || PRIORITIES[1];
              const cat = CATEGORIES.find((c) => c.id === todo.category);
              const overdue = !todo.done && isOverdue(todo.dueDate);
              return (
                <li key={todo.id} className={`task-card${todo.done ? " done" : ""}`}>
                  <button
                    className={`checkbox${todo.done ? " checked" : ""}`}
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {todo.done && <Check size={13} strokeWidth={3} />}
                  </button>
                  <div className="task-body">
                    <p className={`task-text${todo.done ? " done" : ""}`}>{todo.text}</p>
                    <div className="task-meta">
                      {cat && (
                        <span className="badge badge-cat">{cat.label}</span>
                      )}
                      <span className={`badge ${prio.badge}`}>{prio.label}</span>
                      {todo.dueDate && (
                        <span className={`badge ${overdue ? "badge-overdue" : "badge-due"}`}>
                          <Calendar size={10} />
                          {overdue ? "Overdue: " : ""}{formatDate(todo.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="btn-icon" onClick={() => deleteTodo(todo.id)} aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </>
  );
}
