import React from 'react'
import { AnimatePresence, motion } from "motion/react"
import { Moon, Sun } from 'lucide-react'
import { toggleTheme, useTheme } from '../theme'

function ThemeToggle({ className = "" }) {
  const theme = useTheme()
  const isLight = theme === "light"
  const label = isLight ? "Switch to dark mode" : "Switch to light mode"

  return (
    <button
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={`relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden text-slate-500 hover:text-slate-100 hover:bg-fg/[0.06] transition-colors cursor-pointer ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -60 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 60 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} className="text-amber-300" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export default ThemeToggle
