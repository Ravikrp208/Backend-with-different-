import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="flex items-center space-x-6">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="h-16 w-16 transition-transform hover:scale-110" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="h-16 w-16 transition-transform hover:scale-110 animate-spin-slow" alt="React logo" />
        </a>
      </div>
      
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Team Sync + Tailwind CSS
      </h1>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center space-y-4">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg shadow transition-all active:scale-95"
        >
          Count is {count}
        </button>
        <p className="text-slate-400 text-sm">
          Edit <code className="bg-slate-700 px-2 py-1 rounded text-slate-200">src/App.jsx</code> to test HMR
        </p>
      </div>

      <p className="text-xs text-slate-500">
        Tailwind CSS v4 is configured and working!
      </p>
    </div>
  )
}

export default App

