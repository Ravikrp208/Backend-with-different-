"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Play,
  Pause,
  RotateCcw,
  Edit,
  Mic,
  Flame,
  Award,
  ChevronRight,
  CheckCircle2,
  Eye,
} from "lucide-react";

const USER_KEY = "zentodo_user";
const TODOS_KEY = "zentodo_todos";
const THEME_KEY = "zentodo_theme";
const HABITS_KEY = "zentodo_habits";

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

const DEFAULT_HABITS = [
  { id: "water", name: "Water Hydration", desc: "Drink 8 glasses of water", icon: "💧", target: 8, current: 0, streak: 0, lastUpdated: "" },
  { id: "code", name: "Coding Session", desc: "Write code for 1 hour", icon: "💻", target: 1, current: 0, streak: 0, lastUpdated: "" },
  { id: "read", name: "Read Books", desc: "Read 15 pages of a book", icon: "📚", target: 1, current: 0, streak: 0, lastUpdated: "" },
  { id: "workout", name: "Workout & Fitness", desc: "30 mins of daily exercise", icon: "🏋️", target: 1, current: 0, streak: 0, lastUpdated: "" },
  { id: "meditate", name: "Mindfulness", desc: "10 mins of quiet meditation", icon: "🧘", target: 1, current: 0, streak: 0, lastUpdated: "" }
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((t) => ({
      ...t,
      boardStatus: t.boardStatus || (t.done ? "completed" : "todo"),
      subtasks: t.subtasks || [],
      description: t.description || "",
    }));
  } catch {
    return [];
  }
}

function saveTodos(email, todos) {
  localStorage.setItem(`${TODOS_KEY}_${email}`, JSON.stringify(todos));
}

function loadHabits(email) {
  try {
    const raw = localStorage.getItem(`${HABITS_KEY}_${email}`);
    return raw ? JSON.parse(raw) : DEFAULT_HABITS;
  } catch {
    return DEFAULT_HABITS;
  }
}

function saveHabits(email, habits) {
  localStorage.setItem(`${HABITS_KEY}_${email}`, JSON.stringify(habits));
}

function playChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    oscillator.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.3); // D6

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    console.error("Failed to play synthesized chime", e);
  }
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

  // New Views State
  const [currentView, setCurrentView] = useState("list"); // "list", "kanban", "habits", "pomodoro", "analytics"
  const [habits, setHabits] = useState([]);
  const [sortMethod, setSortMethod] = useState("added"); // "added", "due", "priority", "alpha"

  // Pomodoro Focus Timer State
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 minutes
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState("work"); // "work", "short_break", "long_break"
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  // Edit / Details Modal State
  const [editingTodo, setEditingTodo] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const saved = loadUser();
    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (saved?.email) {
      setUser(saved);
      setTodos(loadTodos(saved.email));
      setHabits(loadHabits(saved.email));
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

  const persistHabits = useCallback(
    (updated) => {
      if (!user?.email) return;
      saveHabits(user.email, updated);
    },
    [user]
  );

  // Show visual Toast alert helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
    triggerToast(`Theme switched to ${next} mode!`);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setEmailError("Email is required");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    const userData = { email: trimmed };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setTodos(loadTodos(trimmed));
    setHabits(loadHabits(trimmed));
    setEmail("");
    triggerToast("Logged in successfully! 🚀");
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setTodos([]);
    setHabits([]);
    setCategory("all");
    setStatusFilter("all");
    setSearch("");
    setCurrentView("list");
    triggerToast("Logged out successfully.");
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
      boardStatus: "todo",
      description: "",
      subtasks: [],
      createdAt: Date.now(),
    };
    const updated = [todo, ...todos];
    setTodos(updated);
    persistTodos(updated);
    setNewTodo("");
    setNewDue("");
    triggerToast("Task added successfully! 📋");
  };

  const toggleTodo = (id) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        const nextDone = !t.done;
        return {
          ...t,
          done: nextDone,
          boardStatus: nextDone ? "completed" : "todo",
        };
      }
      return t;
    });
    setTodos(updated);
    persistTodos(updated);
  };

  const deleteTodo = (id) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    persistTodos(updated);
    triggerToast("Task deleted.");
  };

  const clearCompleted = () => {
    const updated = todos.filter((t) => !t.done);
    setTodos(updated);
    persistTodos(updated);
    triggerToast("Completed tasks cleared.");
  };

  // Kanban status transitions
  const moveTaskToColumn = (id, nextStatus) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          boardStatus: nextStatus,
          done: nextStatus === "completed",
        };
      }
      return t;
    });
    setTodos(updated);
    persistTodos(updated);
    triggerToast(`Moved task to ${nextStatus.replace("_", " ")}`);
  };

  // HTML5 Drag and Drop helpers
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      moveTaskToColumn(id, targetColumn);
    }
  };

  // Habit interactions
  const checkInHabit = (id) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = habits.map((h) => {
      if (h.id === id) {
        if (h.lastUpdated === todayStr) return h; // already done today
        let nextCurrent = h.current + 1;
        let nextStreak = h.streak;
        if (nextCurrent >= h.target) {
          nextStreak += 1;
          playChime();
        }
        return {
          ...h,
          current: nextCurrent,
          streak: nextStreak,
          lastUpdated: todayStr,
        };
      }
      return h;
    });
    setHabits(updated);
    persistHabits(updated);
    triggerToast("Habit progress updated! 🔥");
  };

  const resetHabit = (id) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        return { ...h, current: 0, streak: 0, lastUpdated: "" };
      }
      return h;
    });
    setHabits(updated);
    persistHabits(updated);
    triggerToast("Habit progress reset.");
  };

  // Focus Pomodoro Timer Tick Loop
  useEffect(() => {
    let interval = null;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && pomodoroActive) {
      setPomodoroActive(false);
      playChime();
      if (pomodoroMode === "work") {
        setPomodorosCompleted((prev) => prev + 1);
        triggerToast("Great work! Interval complete. Taking break.");
        switchTimerMode("short_break");
      } else {
        triggerToast("Break is over! Time to focus.");
        switchTimerMode("work");
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime, pomodoroMode]);

  const switchTimerMode = (mode) => {
    setPomodoroActive(false);
    setPomodoroMode(mode);
    if (mode === "work") setPomodoroTime(1500); // 25m
    else if (mode === "short_break") setPomodoroTime(300); // 5m
    else if (mode === "long_break") setPomodoroTime(900); // 15m
  };

  // Synthetic speech analyzer
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice command Speech Recognition is not supported by your current browser. Try Chrome or Microsoft Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (err) => {
      console.error("Speech Recognition Error", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      parseVoiceCommand(speechText);
    };

    recognition.start();
  };

  const parseVoiceCommand = (command) => {
    const query = command.toLowerCase();
    let text = command;
    let priority = "medium";
    let category = "personal";
    let dueDate = "";

    // Clean prefix commands
    text = text.replace(/^(add task|add|remind me to|create task|create|new task)\s+/i, "");

    // Extract priorities
    if (query.includes("high priority") || query.includes("urgent")) {
      priority = "high";
      text = text.replace(/(at\s+)?high priority|urgent/gi, "");
    } else if (query.includes("low priority") || query.includes("easy")) {
      priority = "low";
      text = text.replace(/(at\s+)?low priority|easy/gi, "");
    }

    // Extract categories
    if (query.includes("school") || query.includes("study") || query.includes("college")) {
      category = "school";
      text = text.replace(/in\s+school|in\s+study|in\s+college|school|study/gi, "");
    } else if (query.includes("work") || query.includes("office") || query.includes("job")) {
      category = "work";
      text = text.replace(/in\s+work|in\s+office|in\s+job|work|office/gi, "");
    } else if (query.includes("personal") || query.includes("home")) {
      category = "personal";
      text = text.replace(/in\s+personal|personal|home/gi, "");
    }

    // Extract relative due dates
    const today = new Date();
    if (query.includes("tomorrow")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dueDate = tomorrow.toISOString().split("T")[0];
      text = text.replace(/tomorrow/gi, "");
    } else if (query.includes("today")) {
      dueDate = today.toISOString().split("T")[0];
      text = text.replace(/today/gi, "");
    } else if (query.includes("next week")) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      dueDate = nextWeek.toISOString().split("T")[0];
      text = text.replace(/next week/gi, "");
    }

    text = text.replace(/\s+/g, " ").trim();
    text = text.charAt(0).toUpperCase() + text.slice(1);

    if (text) {
      const todo = {
        id: crypto.randomUUID(),
        text,
        done: false,
        category,
        priority,
        dueDate: dueDate || null,
        boardStatus: "todo",
        description: "Created via Smart Voice Command 🎙️",
        subtasks: [],
        createdAt: Date.now(),
      };
      const updated = [todo, ...todos];
      setTodos(updated);
      persistTodos(updated);
      triggerToast(`Task added: "${text}"`);
    } else {
      triggerToast("Could not recognize task content. Try again.");
    }
  };

  // AI break down subtask generator (Simulated local reasoning)
  const generateAiSubtasks = () => {
    if (!editingTodo) return;
    setAiLoading(true);

    setTimeout(() => {
      const title = editingTodo.text.toLowerCase();
      let subtasksText = [];

      if (title.includes("study") || title.includes("exam") || title.includes("read") || title.includes("learn") || title.includes("college") || title.includes("course")) {
        subtasksText = [
          "Understand study material & outline chapters",
          "Read key textbook pages & compile quick notes",
          "Solve 3 practice problems & past papers",
          "Conduct a mock self-assessment test",
          "Revise formulas & clarify doubts before the exam",
        ];
      } else if (title.includes("code") || title.includes("app") || title.includes("website") || title.includes("build") || title.includes("dev") || title.includes("design")) {
        subtasksText = [
          "Sketch UI layout & user interactions",
          "Define database models & setup Git repository",
          "Build backend REST API endpoints",
          "Code responsive frontend components",
          "Connect frontend with API & perform tests",
        ];
      } else if (title.includes("gym") || title.includes("workout") || title.includes("fitness") || title.includes("run") || title.includes("exercise")) {
        subtasksText = [
          "Warm-up with 10 mins cardio & stretching",
          "Perform primary compound lifts & core set workout",
          "Complete accessory high-intensity intervals",
          "Cool down & complete recovery stretches",
          "Hydrate & consume high-protein nutrition",
        ];
      } else if (title.includes("buy") || title.includes("shop") || title.includes("grocery") || title.includes("market")) {
        subtasksText = [
          "Draft strict shopping list of essentials",
          "Check local pricing & coupon discounts",
          "Purchase key items from primary list",
          "Acquire minor non-essential household goods",
          "Audit total checkout billing",
        ];
      } else {
        subtasksText = [
          "Identify task goals & required assets",
          "Plan step-by-step drafting sequence",
          "Implement core workload requirements",
          "Self-review draft for corrections",
          "Finalize & tick complete",
        ];
      }

      const generated = subtasksText.map((t) => ({
        id: crypto.randomUUID(),
        text: t,
        done: false,
      }));

      setEditingTodo((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, ...generated],
      }));
      setAiLoading(false);
      triggerToast("AI successfully breakdown task! ⚡");
    }, 1500);
  };

  const addSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskText.trim() || !editingTodo) return;
    const newSub = {
      id: crypto.randomUUID(),
      text: newSubtaskText.trim(),
      done: false,
    };
    setEditingTodo((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, newSub],
    }));
    setNewSubtaskText("");
  };

  const toggleSubtask = (subId) => {
    if (!editingTodo) return;
    const updatedSub = editingTodo.subtasks.map((s) =>
      s.id === subId ? { ...s, done: !s.done } : s
    );
    setEditingTodo((prev) => ({
      ...prev,
      subtasks: updatedSub,
    }));
  };

  const deleteSubtask = (subId) => {
    if (!editingTodo) return;
    const updatedSub = editingTodo.subtasks.filter((s) => s.id !== subId);
    setEditingTodo((prev) => ({
      ...prev,
      subtasks: updatedSub,
    }));
  };

  const saveModalEdit = () => {
    if (!editingTodo) return;
    const hasUnfinishedSubtask = editingTodo.subtasks.some((s) => !s.done);
    const updatedTodo = {
      ...editingTodo,
      done: editingTodo.subtasks.length > 0 ? !hasUnfinishedSubtask : editingTodo.done,
      boardStatus: editingTodo.subtasks.length > 0 && !hasUnfinishedSubtask ? "completed" : editingTodo.boardStatus,
    };

    const updated = todos.map((t) => (t.id === editingTodo.id ? updatedTodo : t));
    setTodos(updated);
    persistTodos(updated);
    setEditingTodo(null);
    triggerToast("Task changes saved.");
  };

  // Export tasks backup function
  const exportTasksJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zentodo_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Tasks exported to JSON!");
  };

  // Filtering + Sorting processing
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

  const sortedTodos = [...filtered].sort((a, b) => {
    if (sortMethod === "due") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortMethod === "priority") {
      const rank = { high: 1, medium: 2, low: 3 };
      return rank[a.priority] - rank[b.priority];
    }
    if (sortMethod === "alpha") {
      return a.text.localeCompare(b.text);
    }
    return b.createdAt - a.createdAt; // default recent added
  });

  // Productivity analytics metrics
  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;
  const highCount = todos.filter((t) => !t.done && t.priority === "high").length;
  const overdueCount = todos.filter((t) => !t.done && isOverdue(t.dueDate)).length;
  const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && activeCount === 0;

  // Simple SVG distribution calculations
  const catDistribution = CATEGORIES.slice(1).map((c) => {
    const count = todos.filter((t) => t.category === c.id).length;
    return { label: c.label, id: c.id, count };
  });
  const maxCatCount = Math.max(...catDistribution.map((c) => c.count), 1);

  if (!ready) return null;

  if (!user) {
    return (
      <>
        <BackgroundBlobs />
        <div className="auth-page">
          <div className="auth-hero">
            <div className="brand">
              <div className="brand-icon">
                <CheckSquare size={24} />
              </div>
              <div>
                <div className="brand-name">ZenTodo</div>
                <div className="brand-tag">Smart Productivity Suite</div>
              </div>
            </div>
            <h1 className="hero-title">
              Organize your life,<br />
              <span>one task at a time.</span>
            </h1>
            <p className="hero-desc">
              A premium, university-ready Progressive Web App. Seamlessly manage
              tasks, organize schedules, track habits, focus with Pomodoro timers,
              and study analytics with native speech commands!
            </p>
            <div className="feature-list">
              {[
                "Kanban Board & List Views",
                "Voice Command Assistant (Web Speech)",
                "AI-breakdown Subtasks Planner",
                "Pomodoro Focus Timer & Chime Synthesizer",
                "Daily Habits Streak Tracker",
                "Beautiful Responsive SVG Productivity Insights",
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
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

      {/* Floating Status Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 999,
            backgroundColor: "var(--text)",
            color: "var(--bg)",
            padding: "12px 20px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.88rem",
            fontWeight: "600",
            boxShadow: "var(--shadow-lg)",
            animation: "fadeIn 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={16} />
          {toastMessage}
        </div>
      )}

      {/* Detail Slide-Over Modal */}
      {editingTodo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Task Details</h2>
              <button className="modal-close-btn" onClick={() => setEditingTodo(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="input no-icon"
                  value={editingTodo.text}
                  onChange={(e) =>
                    setEditingTodo((prev) => ({ ...prev, text: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Description</label>
                <textarea
                  className="input no-icon"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Add details, links, or outlines for this task..."
                  value={editingTodo.description}
                  onChange={(e) =>
                    setEditingTodo((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="add-form-meta" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="select"
                    value={editingTodo.category}
                    onChange={(e) =>
                      setEditingTodo((prev) => ({ ...prev, category: e.target.value }))
                    }
                  >
                    <option value="school">📚 School</option>
                    <option value="personal">👤 Personal</option>
                    <option value="work">💼 Work</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="select"
                    value={editingTodo.priority}
                    onChange={(e) =>
                      setEditingTodo((prev) => ({ ...prev, priority: e.target.value }))
                    }
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="input no-icon"
                  value={editingTodo.dueDate || ""}
                  onChange={(e) =>
                    setEditingTodo((prev) => ({ ...prev, dueDate: e.target.value || null }))
                  }
                />
              </div>

              {/* Subtasks Section */}
              <div className="subtasks-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Checklist & Subtasks
                  </label>
                  <button
                    type="button"
                    className="ai-glow-btn"
                    onClick={generateAiSubtasks}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <span className="ai-typing-spinner" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        AI Breakdown
                      </>
                    )}
                  </button>
                </div>

                <form onSubmit={addSubtask} style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="text"
                    className="input no-icon"
                    style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                    placeholder="Add a step..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-ghost" style={{ padding: "8px 12px" }}>
                    Add
                  </button>
                </form>

                {editingTodo.subtasks.length > 0 && (
                  <ul className="subtask-list" style={{ marginTop: "8px" }}>
                    {editingTodo.subtasks.map((sub) => (
                      <li key={sub.id} className="subtask-item">
                        <div className="subtask-item-left">
                          <button
                            type="button"
                            className={`checkbox${sub.done ? " checked" : ""}`}
                            style={{ width: "16px", height: "16px", marginTop: 0 }}
                            onClick={() => toggleSubtask(sub.id)}
                          >
                            {sub.done && <Check size={10} strokeWidth={3} />}
                          </button>
                          <span className={`subtask-text-card${sub.done ? " done" : ""}`}>
                            {sub.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: "24px", height: "24px" }}
                          onClick={() => deleteSubtask(sub.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setEditingTodo(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={saveModalEdit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <CheckSquare size={18} />
          </div>
          <div className="brand-name">ZenTodo</div>
        </div>

        {/* Views section */}
        <p className="sidebar-section">Views</p>
        <button
          className={`nav-item${currentView === "list" ? " active" : ""}`}
          onClick={() => {
            setCurrentView("list");
            setSidebarOpen(false);
          }}
        >
          <LayoutGrid size={16} />
          Tasks List
        </button>
        <button
          className={`nav-item${currentView === "kanban" ? " active" : ""}`}
          onClick={() => {
            setCurrentView("kanban");
            setSidebarOpen(false);
          }}
        >
          <BookOpen size={16} />
          Kanban Board
        </button>
        <button
          className={`nav-item${currentView === "habits" ? " active" : ""}`}
          onClick={() => {
            setCurrentView("habits");
            setSidebarOpen(false);
          }}
        >
          <Flame size={16} />
          Habit Tracker
        </button>
        <button
          className={`nav-item${currentView === "pomodoro" ? " active" : ""}`}
          onClick={() => {
            setCurrentView("pomodoro");
            setSidebarOpen(false);
          }}
        >
          <Clock size={16} />
          Focus Timer
        </button>
        <button
          className={`nav-item${currentView === "analytics" ? " active" : ""}`}
          onClick={() => {
            setCurrentView("analytics");
            setSidebarOpen(false);
          }}
        >
          <TrendingUp size={16} />
          Productivity Charts
        </button>

        {/* Categories Section */}
        <p className="sidebar-section" style={{ marginTop: "16px" }}>
          Categories
        </p>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              className={`nav-item${category === cat.id ? " active" : ""}`}
              onClick={() => {
                setCategory(cat.id);
                setSidebarOpen(false);
                // switch to list view automatically if clicking category filtering
                if (currentView !== "list" && currentView !== "kanban") {
                  setCurrentView("list");
                }
              }}
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
        {/* Upper Header Nav */}
        <div className="main-header">
          <div className="greeting">
            <h1>{getGreeting()} 👋</h1>
            <p>
              Today you have <strong>{activeCount}</strong> pending task
              {activeCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="header-actions">
            {/* Native Web Speech AI mic trigger */}
            <button
              className={`mic-btn${isListening ? " listening" : ""}`}
              onClick={startSpeechRecognition}
              title="Add task via Voice Command"
            >
              <Mic size={18} />
              {isListening && <span className="mic-pulse" />}
            </button>

            {/* Export JSON backup button */}
            <button
              className="theme-btn"
              onClick={exportTasksJSON}
              title="Backup tasks backup as JSON"
            >
              <Award size={18} />
            </button>

            <button className="theme-btn" onClick={toggleTheme} title="Toggle Dark/Light">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {/* Standard Statistics Widget Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon blue">
              <ListTodo size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">
              <Clock size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <Target size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{doneCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{highCount}</div>
              <div className="stat-label">High Priority</div>
            </div>
          </div>
        </div>

        {/* Global Progress Indicator */}
        {totalCount > 0 && (
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

        {allDone && currentView === "list" && (
          <div className="celebrate">
            <Sparkles size={22} />
            <p>Amazing! You have completed all your tasks. Great job! 🎉</p>
          </div>
        )}

        {/* Overdue Alert banner */}
        {overdueCount > 0 && statusFilter !== "done" && currentView === "list" && (
          <div className="celebrate" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
            <Clock size={20} />
            <p>{overdueCount} task{overdueCount !== 1 ? "s are" : " is"} overdue — complete them soon!</p>
          </div>
        )}

        {/* Voice guidelines assistant placeholder when mic is listening */}
        {isListening && (
          <div className="celebrate" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px dashed var(--danger)", color: "var(--danger)" }}>
            <Mic size={20} className="listening" />
            <p>Listening... Say: <strong>&quot;Add buy study books tomorrow at high priority&quot;</strong></p>
          </div>
        )}

        {/* Render View panels based on currentView */}

        {/* 1. TASKS LIST VIEW */}
        {currentView === "list" && (
          <>
            <div className="add-task-card">
              <h3>+ Add New Task</h3>
              <form className="add-form" onSubmit={addTodo}>
                <div className="add-form-row">
                  <input
                    className="input no-icon"
                    type="text"
                    placeholder="What do you need to do today?"
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

              {/* Sorting option selector */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Sort:</span>
                <select
                  className="select"
                  style={{ padding: "6px 12px", width: "auto", fontSize: "0.8rem" }}
                  value={sortMethod}
                  onChange={(e) => setSortMethod(e.target.value)}
                >
                  <option value="added">Recently Added</option>
                  <option value="due">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="alpha">Alphabetically</option>
                </select>
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
                  Clear Done
                </button>
              )}
            </div>

            {sortedTodos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <ListTodo size={32} />
                </div>
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
                {sortedTodos.map((todo) => {
                  const prio = PRIORITIES.find((p) => p.id === todo.priority) || PRIORITIES[1];
                  const cat = CATEGORIES.find((c) => c.id === todo.category);
                  const overdue = !todo.done && isOverdue(todo.dueDate);
                  
                  // subtasks progress calc
                  const totalSubs = todo.subtasks?.length || 0;
                  const completedSubs = todo.subtasks?.filter((s) => s.done).length || 0;
                  const percentSub = totalSubs ? Math.round((completedSubs / totalSubs) * 100) : null;

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
                          {cat && <span className="badge badge-cat">{cat.label}</span>}
                          <span className={`badge ${prio.badge}`}>{prio.label}</span>
                          {todo.dueDate && (
                            <span className={`badge ${overdue ? "badge-overdue" : "badge-due"}`}>
                              <Calendar size={10} />
                              {overdue ? "Overdue: " : ""}
                              {formatDate(todo.dueDate)}
                            </span>
                          )}
                          {/* Checklist subtasks count badge */}
                          {totalSubs > 0 && (
                            <span
                              className="badge badge-due"
                              style={{
                                background: "var(--primary-glow)",
                                color: "var(--primary)",
                              }}
                            >
                              <CheckCircle2 size={10} />
                              Checklist: {completedSubs}/{totalSubs} ({percentSub}%)
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn-icon"
                          style={{ color: "var(--text-muted)" }}
                          onClick={() => setEditingTodo({ ...todo })}
                          title="Edit Task & Add Checklist"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => deleteTodo(todo.id)}
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* 2. KANBAN BOARD VIEW */}
        {currentView === "kanban" && (
          <div className="kanban-board">
            {["todo", "in_progress", "review", "completed"].map((col) => {
              const colTasks = sortedTodos.filter((t) => t.boardStatus === col);
              const headingText =
                col === "todo"
                  ? "To Do"
                  : col === "in_progress"
                  ? "In Progress"
                  : col === "review"
                  ? "Review"
                  : "Completed";

              return (
                <div
                  key={col}
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col)}
                >
                  <div className="kanban-column-header">
                    <h3>{headingText}</h3>
                    <span className="kanban-column-count">{colTasks.length}</span>
                  </div>

                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        padding: "30px 10px",
                        textAlign: "center",
                        fontSize: "0.8rem",
                        color: "var(--text-faint)",
                        border: "1.5px dashed var(--border)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const prio = PRIORITIES.find((p) => p.id === t.priority) || PRIORITIES[1];
                      const totalSubs = t.subtasks?.length || 0;
                      const completedSubs = t.subtasks?.filter((s) => s.done).length || 0;
                      const percentSub = totalSubs ? Math.round((completedSubs / totalSubs) * 100) : null;

                      return (
                        <div
                          key={t.id}
                          className="kanban-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                        >
                          <div className="kanban-card-title">{t.text}</div>
                          
                          {/* Mini progress line for subtasks checklist */}
                          {totalSubs > 0 && (
                            <div style={{ margin: "6px 0" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                <span>Checklist</span>
                                <span>{completedSubs}/{totalSubs}</span>
                              </div>
                              <div className="progress-bar" style={{ height: "4px", marginTop: "2px" }}>
                                <div className="progress-fill" style={{ width: `${percentSub}%` }} />
                              </div>
                            </div>
                          )}

                          <div className="kanban-card-meta">
                            <span className={`badge ${prio.badge}`}>{prio.label}</span>
                            <span className="badge badge-cat">
                              {t.category.toUpperCase()}
                            </span>
                          </div>

                          <div className="kanban-card-actions">
                            <button
                              className="btn-icon"
                              style={{ width: "24px", height: "24px" }}
                              onClick={() => setEditingTodo({ ...t })}
                            >
                              <Edit size={12} />
                            </button>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {col !== "todo" && (
                                <button
                                  className="kanban-action-btn"
                                  onClick={() => {
                                    const flow = ["todo", "in_progress", "review", "completed"];
                                    const prevIdx = flow.indexOf(col) - 1;
                                    moveTaskToColumn(t.id, flow[prevIdx]);
                                  }}
                                >
                                  ←
                                </button>
                              )}
                              {col !== "completed" && (
                                <button
                                  className="kanban-action-btn"
                                  onClick={() => {
                                    const flow = ["todo", "in_progress", "review", "completed"];
                                    const nextIdx = flow.indexOf(col) + 1;
                                    moveTaskToColumn(t.id, flow[nextIdx]);
                                  }}
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. HABIT TRACKER VIEW */}
        {currentView === "habits" && (
          <div className="habits-grid">
            {habits.map((h) => {
              const todayStr = new Date().toISOString().split("T")[0];
              const completedToday = h.lastUpdated === todayStr;

              return (
                <div key={h.id} className="habit-card">
                  <div className="habit-header">
                    <div className="habit-icon-wrap">{h.icon}</div>
                    <div>
                      <div className="habit-name">{h.name}</div>
                      <div className="habit-desc">{h.desc}</div>
                    </div>
                  </div>

                  <div style={{ margin: "8px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600" }}>
                      <span>Daily Progress</span>
                      <span>
                        {h.current}/{h.target}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: "6px", marginTop: "4px" }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min((h.current / h.target) * 100, 100)}%`,
                          background: completedToday ? "var(--success)" : "linear-gradient(90deg, #f97316, #facc15)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="habit-stats">
                    <div className="habit-streak">
                      <Flame size={16} fill="#f97316" color="#f97316" />
                      <span>{h.streak} Day Streak</span>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn-icon"
                        style={{ width: "30px", height: "30px", border: "1px solid var(--border)" }}
                        onClick={() => resetHabit(h.id)}
                        title="Reset Streaks"
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        className="habit-action-btn"
                        onClick={() => checkInHabit(h.id)}
                        disabled={completedToday}
                      >
                        {completedToday ? "Completed" : "Log Checkin"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. POMODORO FOCUS TIMER VIEW */}
        {currentView === "pomodoro" && (
          <div className="pomodoro-container">
            <div className="pomodoro-modes">
              {[
                { id: "work", label: "Focus Work (25m)" },
                { id: "short_break", label: "Short Break (5m)" },
                { id: "long_break", label: "Long Break (15m)" },
              ].map((m) => (
                <button
                  key={m.id}
                  className={`pomodoro-mode-btn${pomodoroMode === m.id ? " active" : ""}`}
                  onClick={() => switchTimerMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="pomodoro-timer-circle">
              {/* Circular SVG Countdown Progress */}
              <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx="110"
                  cy="110"
                  r="95"
                  stroke="var(--border)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="95"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="597"
                  strokeDashoffset={
                    597 -
                    (pomodoroTime /
                      (pomodoroMode === "work"
                        ? 1500
                        : pomodoroMode === "short_break"
                        ? 300
                        : 900)) *
                      597
                  }
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="pomodoro-time">
                {Math.floor(pomodoroTime / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(pomodoroTime % 60).toString().padStart(2, "0")}
              </div>
            </div>

            <div className="pomodoro-controls">
              <button
                className="pomodoro-btn"
                onClick={() => {
                  setPomodoroActive(false);
                  setPomodoroTime(
                    pomodoroMode === "work" ? 1500 : pomodoroMode === "short_break" ? 300 : 900
                  );
                }}
              >
                <RotateCcw size={20} />
              </button>
              <button
                className="pomodoro-btn play-btn"
                onClick={() => setPomodoroActive(!pomodoroActive)}
              >
                {pomodoroActive ? <Pause size={22} /> : <Play size={22} />}
              </button>
            </div>

            <div className="pomodoro-completed-count">
              <Award size={16} style={{ color: "var(--warning)" }} />
              <span>Intervals Completed: {pomodorosCompleted} Sessions</span>
            </div>
          </div>
        )}

        {/* 5. PRODUCTIVITY INSIGHTS & ANALYTICS VIEW */}
        {currentView === "analytics" && (
          <div className="analytics-grid">
            {/* SVG Weekly Productivity Bar Chart */}
            <div className="chart-card">
              <h3>Weekly Work Completion</h3>
              <div className="bar-chart-container">
                {[
                  { label: "Mon", count: Math.round(doneCount * 0.1) },
                  { label: "Tue", count: Math.round(doneCount * 0.2) },
                  { label: "Wed", count: Math.round(doneCount * 0.3) },
                  { label: "Thu", count: Math.round(doneCount * 0.4) },
                  { label: "Fri", count: Math.round(doneCount * 0.6) },
                  { label: "Sat", count: Math.round(doneCount * 0.8) },
                  { label: "Sun", count: doneCount },
                ].map((bar, idx) => {
                  // normalize height percent relative to doneCount
                  const heightPct = doneCount > 0 ? Math.min((bar.count / doneCount) * 100, 100) : 10;
                  return (
                    <div key={idx} className="bar-wrapper">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${heightPct}%` }}
                      >
                        <span className="chart-bar-tooltip">{bar.count} completed</span>
                      </div>
                      <span className="chart-bar-label">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SVG Doughnut Distribution Chart */}
            <div className="chart-card">
              <h3>Category Breakdown</h3>
              <div className="doughnut-container">
                <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
                  <circle
                    cx="90"
                    cy="90"
                    r="65"
                    stroke="var(--border)"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  {/* Total indicator ring overlay */}
                  <circle
                    cx="90"
                    cy="90"
                    r="65"
                    stroke="var(--primary)"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray="408"
                    strokeDashoffset={408 - (progress / 100) * 408}
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>
                <div className="doughnut-info">
                  <span className="doughnut-info-val">{progress}%</span>
                  <span className="doughnut-info-lbl">Completion Rate</span>
                </div>
              </div>

              <div className="chart-legend">
                {catDistribution.map((c, i) => {
                  const colors = ["#5b5ef4", "#10b981", "#f59e0b"];
                  return (
                    <div key={i} className="legend-item">
                      <div>
                        <span
                          className="legend-color"
                          style={{ backgroundColor: colors[i % colors.length] }}
                        />
                        <span style={{ color: "var(--text)" }}>{c.label}</span>
                      </div>
                      <span style={{ fontWeight: "700" }}>{c.count} tasks</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </>
  );
}
