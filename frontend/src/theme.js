import { useSyncExternalStore } from "react"

// The initial theme is applied by an inline script in index.html before the first paint
const STORAGE_KEY = "cortex-theme"
const listeners = new Set()

export const getTheme = () => document.documentElement.dataset.theme === "light" ? "light" : "dark"

export const setTheme = (theme) => {
    const root = document.documentElement
    // Animate colours only during the switch, not on every hover/interaction
    root.classList.add("theme-transition")
    root.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f4f5f9" : "#05060a")
    try {
        localStorage.setItem(STORAGE_KEY, theme)
    } catch {
        // Storage can be unavailable (private mode); the theme still applies for this visit
    }
    window.setTimeout(() => root.classList.remove("theme-transition"), 350)
    listeners.forEach(listener => listener())
}

export const toggleTheme = () => setTheme(getTheme() === "light" ? "dark" : "light")

const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export const useTheme = () => useSyncExternalStore(subscribe, getTheme)
