# ZenTodo - Advanced Smart Productivity Suite (PWA)

ZenTodo is a modern, high-fidelity Progressive Web App (PWA) built using **Next.js 16**, **React 19**, and **Vanilla CSS**. Designed for students and developers, it integrates multiple premium productivity tools into a single glassmorphic interface, making it perfect for university project submissions!

---

## ✨ Key Features Added

1. **📋 Kanban Board View (Drag & Drop)**
   - Custom Kanban columns: `To Do`, `In Progress`, `Review`, and `Completed`.
   - Direct HTML5 drag-and-drop mechanics to move tasks between columns.
   - Quick navigation buttons (`←` and `→`) for mobile responsiveness.

2. **🎙️ Native AI Voice Assistant (Web Speech API)**
   - An on-click microphone button that uses the browser's native speech recognition.
   - Parses complex vocal commands like: *"Add study study guide tomorrow at high priority"* or *"Create personal task workout today"* and sets category, priority, and due dates automatically.

3. **✨ AI Task Breakdown (Simulated AI Agent)**
   - Tapping the "AI Breakdown" button inside any task's edit drawer triggers a typing animation and locally parses key topic queries (e.g. exams, programming, fitness, groceries).
   - Generates 5 context-aware subtask checklist items to jumpstart your workflow.

4. **🍅 Pomodoro Focus Timer**
   - Synthesizes electronic audio chime alerts using the browser's native **Web Audio API** (no file assets or external endpoints needed).
   - Trackable intervals: Focus Work (25m), Short Break (5m), and Long Break (15m).
   - Animated SVG countdown circle and focus session metrics.

5. **🔥 Daily Habit Tracker**
   - Keep daily tabs on essential habits: 💧 Water, 💻 Coding, 📚 Reading, 🏋️ Workout, and 🧘 Meditation.
   - Increments streaks and updates a streak flame indicator.

6. **📊 Interactive SVG Analytics Dashboard**
   - Clean, lightweight SVG charts tracking weekly tasks completed, completion rates, and categorical workloads (School, Personal, Work).

7. **✏️ Details Edit Drawer**
   - Double-clicking or clicking edit on any task opens a beautiful modal to edit details, add descriptions, add custom checklists, and run the AI breakdowns.

---

## 🚀 Getting Started

### Installation

First, clone the repository and install all node packages:

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the ZenTodo application.

---

## 🛠️ Tech Stack & Optimization
- **Framework**: Next.js 16 (App Router)
- **State Management**: React state synced with custom `localStorage` handlers.
- **Styling**: Modern Vanilla CSS containing HSL themes, blur overlays, and responsive breakpoints.
- **Icons**: Lucide React
