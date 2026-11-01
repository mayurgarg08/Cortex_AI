// Colour palettes shared by the PPT and PDF generators (hex without "#")

const PALETTES = [
    { name: "indigo", primary: "6366F1", secondary: "8B5CF6", accent: "22D3EE", dark: "0F1029", darkAlt: "1C1E4A", tint: "EEF0FF" },
    { name: "ocean", primary: "2563EB", secondary: "06B6D4", accent: "F472B6", dark: "0A1630", darkAlt: "13254A", tint: "EAF2FF" },
    { name: "emerald", primary: "059669", secondary: "0EA5E9", accent: "F59E0B", dark: "04231F", darkAlt: "0A3A33", tint: "E7F8F2" },
    { name: "sunset", primary: "EA580C", secondary: "DB2777", accent: "FACC15", dark: "1F0F1A", darkAlt: "33172A", tint: "FFF1E8" },
    { name: "royal", primary: "7C3AED", secondary: "DB2777", accent: "38BDF8", dark: "160B2E", darkAlt: "26154A", tint: "F3EDFF" },
]

export const NEUTRAL = {
    ink: "0F172A",
    body: "334155",
    muted: "64748B",
    faint: "94A3B8",
    border: "E2E8F0",
    surface: "F8FAFC",
    white: "FFFFFF",
}

// The same title always gets the same palette, different topics get variety
export const pickPalette = (seed = "") => {
    let hash = 0
    for (const ch of String(seed)) hash = (hash * 31 + ch.codePointAt(0)) >>> 0
    return PALETTES[hash % PALETTES.length]
}

export const formatDate = (date = new Date()) =>
    date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

export const pad2 = (n) => String(n).padStart(2, "0")
